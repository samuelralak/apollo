import type NDK from "@nostr-dev-kit/ndk";
import type { NDKEvent, NDKFilter } from "@nostr-dev-kit/ndk";
import type {
    ManagedSubscription,
    SubscriptionConfig,
    SubscriptionHandle,
    SubscriptionStats,
    BufferedEvent,
    BufferedEventTarget,
    SubscriptionContext
} from "./types";
import { EventHandlingMode, ResourceType } from "./types";
import { hashFilter, normalizeFilter, contextMatches } from "./utils";

/**
 * Centralized subscription manager for Nostr events.
 *
 * Key responsibilities:
 * 1. Deduplicates subscriptions with identical filters (reference counting)
 * 2. Deduplicates events using seen event IDs (unified across modes)
 * 3. Supports IMMEDIATE and BUFFERED modes for event handling
 * 4. Handles multiple contexts per buffered event (no collision)
 * 5. Provides clean lifecycle management with proper cleanup
 *
 * Usage:
 *   const manager = SubscriptionManager.getInstance();
 *   manager.initialize(ndk, dispatch);
 *   const handle = manager.subscribe(config);
 *   handle.unsubscribe(); // when done
 *
 * TODO: "Late Joiner" Issue
 * When reusing an existing subscription (same filter hash), new subscribers
 * joining after EOSE will not receive historical events that were already
 * processed. This is fine for "live stream" use cases but breaks UI that
 * expects to load past data (profiles, threads).
 *
 * Recommended fix: "Cache & Replay" Strategy (similar to RxJS ReplaySubject)
 * - Store full event objects in a `recentEvents: Map<string, NDKEvent>` inside
 *   ManagedSubscription (with LRU pruning, e.g., last 100-500 events)
 * - When a new subscriber joins an existing subscription:
 *   1. Iterate over `recentEvents`
 *   2. Filter events matching the new subscriber's context (if applicable)
 *   3. Emit those events to the new subscriber immediately
 *   4. Then add subscriber to callbacks for future live events
 * - This ensures late joiners receive current state without re-fetching from relays
 */
class SubscriptionManager {
    private static instance: SubscriptionManager | null = null;

    private ndk: NDK | null = null;
    private subscriptions: Map<string, ManagedSubscription> = new Map();
    private bufferedEvents: Map<string, BufferedEvent> = new Map();
    private globalSeenEventIds: Set<string> = new Set();
    private dispatchFn: ((action: { type: string; payload: unknown }) => void) | null = null;

    // Configuration
    private readonly EOSE_TIMEOUT_MS = 10000;
    private readonly MAX_GLOBAL_SEEN_EVENTS = 10000;
    private readonly MAX_SUBSCRIPTION_SEEN_EVENTS = 5000;
    private readonly BUFFER_CLEANUP_INTERVAL_MS = 60000;
    private readonly STALE_EVENT_THRESHOLD_MS = 3600000; // 1 hour

    private cleanupIntervalId: ReturnType<typeof setInterval> | null = null;

    private constructor() {
        // Private constructor for singleton
    }

    /**
     * Get the singleton instance
     */
    static getInstance(): SubscriptionManager {
        if (!SubscriptionManager.instance) {
            SubscriptionManager.instance = new SubscriptionManager();
        }
        return SubscriptionManager.instance;
    }

    /**
     * Initialize the manager with NDK instance and Redux dispatch
     */
    initialize(ndk: NDK, dispatch: (action: { type: string; payload: unknown }) => void): void {
        this.ndk = ndk;
        this.dispatchFn = dispatch;
        this.startCleanupInterval();
    }

    /**
     * Check if manager is initialized
     */
    isInitialized(): boolean {
        return this.ndk !== null && this.dispatchFn !== null;
    }

    /**
     * Subscribe to events with the given configuration
     */
    subscribe(config: SubscriptionConfig): SubscriptionHandle {
        if (!this.ndk) {
            throw new Error("SubscriptionManager not initialized. Call initialize() first.");
        }

        const normalizedFilters = Array.isArray(config.filters)
            ? config.filters.map(normalizeFilter)
            : [normalizeFilter(config.filters)];

        const filterHash = hashFilter(normalizedFilters);

        let managed = this.subscriptions.get(filterHash);

        if (managed) {
            // Reuse existing subscription, increment ref count
            managed.refCount++;
            managed.subscribers.add(config.id);
            managed.callbacks.set(config.id, {
                onEvent: config.onEvent,
                onEose: config.onEose,
                mode: config.mode,
                resourceType: config.resourceType,
                context: config.context
            });

            // If EOSE already received, immediately call the callback
            if (managed.eoseReceived && config.onEose) {
                config.onEose();
            }
        } else {
            // Create new subscription
            managed = this.createManagedSubscription(config, filterHash, normalizedFilters);
            this.subscriptions.set(filterHash, managed);
        }

        return {
            id: config.id,
            unsubscribe: () => this.unsubscribe(filterHash, config.id)
        };
    }

    /**
     * Unsubscribe a specific subscriber from a filter
     */
    private unsubscribe(filterHash: string, subscriberId: string): void {
        const managed = this.subscriptions.get(filterHash);
        if (!managed) return;

        managed.subscribers.delete(subscriberId);
        managed.callbacks.delete(subscriberId);
        managed.refCount--;

        if (managed.refCount <= 0) {
            // Clear the EOSE timeout to prevent timer leak
            if (managed.eoseTimeoutId) {
                clearTimeout(managed.eoseTimeoutId);
            }

            // No more subscribers, stop the subscription
            managed.subscription.stop();
            this.subscriptions.delete(filterHash);
        }
    }

    /**
     * Create a new managed subscription
     */
    private createManagedSubscription(
        config: SubscriptionConfig,
        filterHash: string,
        normalizedFilters: NDKFilter[]
    ): ManagedSubscription {
        const options = { closeOnEose: false, ...config.options };
        const subscription = this.ndk!.subscribe(normalizedFilters, options);

        const managed: ManagedSubscription = {
            filterHash,
            subscription,
            refCount: 1,
            subscribers: new Set([config.id]),
            callbacks: new Map([[config.id, {
                onEvent: config.onEvent,
                onEose: config.onEose,
                mode: config.mode,
                resourceType: config.resourceType,
                context: config.context
            }]]),
            createdAt: Date.now(),
            seenEventIds: new Set(),
            eoseReceived: false
        };

        // Set up event handlers
        subscription.on('event', (event: NDKEvent) => {
            this.handleEvent(managed, event);
        });

        subscription.on('eose', () => {
            this.handleEose(managed);
        });

        // EOSE timeout fallback - store the timeout ID for cleanup
        managed.eoseTimeoutId = setTimeout(() => {
            if (!managed.eoseReceived) {
                console.warn(`EOSE timeout for filter ${filterHash.substring(0, 50)}...`);
                this.handleEose(managed);
            }
        }, this.EOSE_TIMEOUT_MS);

        return managed;
    }

    /**
     * Handle incoming event with unified deduplication
     */
    private handleEvent(managed: ManagedSubscription, event: NDKEvent): void {
        // 1. Local deduplication (per-subscription)
        // Check if THIS specific subscription has already processed this event
        if (managed.seenEventIds.has(event.id)) {
            return;
        }

        // Add to local seen set with LRU pruning
        this.addToLocalSeen(managed, event.id);

        // 2. Global tracking (for stats, not for blocking)
        const isGloballyNew = !this.globalSeenEventIds.has(event.id);
        if (isGloballyNew) {
            this.addToGlobalSeen(event.id);
        }

        // 3. Notify all subscribers based on their mode
        managed.callbacks.forEach((callbacks) => {
            if (callbacks.mode === EventHandlingMode.IMMEDIATE) {
                // Immediate mode: fire directly
                callbacks.onEvent?.(event);
            } else {
                // Buffered mode: ALWAYS attempt to buffer.
                // bufferEvent internally checks if this specific resourceType/context
                // target has already been recorded, preventing duplicates.
                this.bufferEvent(event, callbacks.resourceType, callbacks.context);
            }
        });
    }

    /**
     * Handle EOSE (End of Stored Events)
     */
    private handleEose(managed: ManagedSubscription): void {
        if (managed.eoseReceived) return;
        managed.eoseReceived = true;

        // Clear the timeout since EOSE was received
        if (managed.eoseTimeoutId) {
            clearTimeout(managed.eoseTimeoutId);
            managed.eoseTimeoutId = undefined;
        }

        managed.callbacks.forEach((callbacks) => {
            callbacks.onEose?.();
        });
    }

    /**
     * Buffer an event for later display - handles multiple contexts per event
     */
    private bufferEvent(
        event: NDKEvent,
        resourceType: ResourceType,
        context?: SubscriptionContext
    ): void {
        const target: BufferedEventTarget = { resourceType, context };

        let buffered = this.bufferedEvents.get(event.id);

        if (buffered) {
            // Event already buffered - add this target if not already present
            const hasTarget = buffered.targets.some(t =>
                t.resourceType === resourceType && contextMatches(t.context, context)
            );
            if (!hasTarget) {
                buffered.targets.push(target);
            }
        } else {
            // New buffered event
            buffered = {
                id: event.id,
                event,
                targets: [target],
                receivedAt: Date.now()
            };
            this.bufferedEvents.set(event.id, buffered);
        }

        // Dispatch action to update pending counts in Redux
        if (this.dispatchFn) {
            this.dispatchFn({
                type: 'subscription/addPendingEvent',
                payload: {
                    eventId: event.id,
                    resourceType,
                    context,
                    timestamp: event.created_at
                }
            });
        }
    }

    /**
     * Flush buffered events for a resource type/context
     * Handles partial flush when event has multiple targets
     */
    flushBufferedEvents(
        resourceType: ResourceType,
        context?: SubscriptionContext,
        callback?: (event: NDKEvent) => void
    ): void {
        const toProcess: BufferedEvent[] = [];

        // Collect matching events
        this.bufferedEvents.forEach((buffered) => {
            const matchingTargetIndex = buffered.targets.findIndex(t =>
                t.resourceType === resourceType &&
                (!context || contextMatches(t.context, context))
            );

            if (matchingTargetIndex !== -1) {
                toProcess.push(buffered);
            }
        });

        // Sort by event timestamp (oldest first)
        toProcess.sort((a, b) => (a.event.created_at ?? 0) - (b.event.created_at ?? 0));

        // Process each buffered event with error handling
        toProcess.forEach((buffered) => {
            try {
                callback?.(buffered.event);
            } catch (error) {
                console.error('Error processing buffered event:', error);
            }

            // Remove the matching target
            const matchingTargetIndex = buffered.targets.findIndex(t =>
                t.resourceType === resourceType &&
                (!context || contextMatches(t.context, context))
            );

            if (matchingTargetIndex !== -1) {
                buffered.targets.splice(matchingTargetIndex, 1);
            }

            // If no targets left, remove the event entirely
            if (buffered.targets.length === 0) {
                this.bufferedEvents.delete(buffered.id);
            }
        });

        // Clear pending state in Redux (always dispatch, even if errors occurred)
        if (this.dispatchFn) {
            this.dispatchFn({
                type: 'subscription/clearPendingEvents',
                payload: { resourceType, context }
            });
        }
    }

    /**
     * Get count of pending events for a resource type
     */
    getPendingCount(resourceType: ResourceType, context?: SubscriptionContext): number {
        let count = 0;
        this.bufferedEvents.forEach((buffered) => {
            const hasMatchingTarget = buffered.targets.some(t =>
                t.resourceType === resourceType &&
                (!context || contextMatches(t.context, context))
            );
            if (hasMatchingTarget) {
                count++;
            }
        });
        return count;
    }

    /**
     * Add event ID to subscription's seen set with LRU-style cleanup
     */
    private addToLocalSeen(managed: ManagedSubscription, eventId: string): void {
        managed.seenEventIds.add(eventId);

        // LRU cleanup when exceeding max
        if (managed.seenEventIds.size > this.MAX_SUBSCRIPTION_SEEN_EVENTS) {
            const toDelete = managed.seenEventIds.size - this.MAX_SUBSCRIPTION_SEEN_EVENTS;
            const iterator = managed.seenEventIds.values();
            for (let i = 0; i < toDelete; i++) {
                const { value } = iterator.next();
                if (value) {
                    managed.seenEventIds.delete(value);
                }
            }
        }
    }

    /**
     * Add event ID to global seen set with LRU-style cleanup
     */
    private addToGlobalSeen(eventId: string): void {
        this.globalSeenEventIds.add(eventId);

        // Cleanup when exceeding max
        if (this.globalSeenEventIds.size > this.MAX_GLOBAL_SEEN_EVENTS) {
            const toDelete = this.globalSeenEventIds.size - this.MAX_GLOBAL_SEEN_EVENTS;
            const iterator = this.globalSeenEventIds.values();
            for (let i = 0; i < toDelete; i++) {
                const { value } = iterator.next();
                if (value) {
                    this.globalSeenEventIds.delete(value);
                }
            }
        }
    }

    /**
     * Start cleanup interval for stale buffered events
     */
    private startCleanupInterval(): void {
        if (this.cleanupIntervalId) return;

        this.cleanupIntervalId = setInterval(() => {
            const staleThreshold = Date.now() - this.STALE_EVENT_THRESHOLD_MS;
            this.bufferedEvents.forEach((buffered, id) => {
                if (buffered.receivedAt < staleThreshold) {
                    this.bufferedEvents.delete(id);
                }
            });
        }, this.BUFFER_CLEANUP_INTERVAL_MS);
    }

    /**
     * Get statistics about current state
     */
    getStats(): SubscriptionStats {
        let totalSubscribers = 0;
        let seenEventsCount = 0;

        this.subscriptions.forEach((managed) => {
            totalSubscribers += managed.subscribers.size;
            seenEventsCount += managed.seenEventIds.size;
        });

        return {
            activeSubscriptions: this.subscriptions.size,
            totalSubscribers,
            uniqueFilters: this.subscriptions.size,
            seenEventsCount: seenEventsCount + this.globalSeenEventIds.size,
            pendingEventsCount: this.bufferedEvents.size
        };
    }

    /**
     * Cleanup - call on app unmount
     */
    destroy(): void {
        if (this.cleanupIntervalId) {
            clearInterval(this.cleanupIntervalId);
            this.cleanupIntervalId = null;
        }

        this.subscriptions.forEach((managed) => {
            // Clear EOSE timeouts
            if (managed.eoseTimeoutId) {
                clearTimeout(managed.eoseTimeoutId);
            }
            managed.subscription.stop();
        });

        this.subscriptions.clear();
        this.bufferedEvents.clear();
        this.globalSeenEventIds.clear();
        this.ndk = null;
        this.dispatchFn = null;

        SubscriptionManager.instance = null;
    }
}

export default SubscriptionManager;
