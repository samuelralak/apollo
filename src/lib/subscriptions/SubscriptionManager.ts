import type NDK from "@nostr-dev-kit/ndk";
import type { NDKEvent, NDKFilter } from "@nostr-dev-kit/ndk";
import type {
    ManagedSubscription,
    SubscriptionConfig,
    SubscriptionHandle,
    SubscriptionStats,
    BufferedEvent,
    SubscriptionContext
} from "./types";
import { EventHandlingMode, ResourceType } from "./types";
import { hashFilter, normalizeFilter, contextMatches } from "./utils";

/**
 * Centralized subscription manager for Nostr events.
 *
 * Key responsibilities:
 * 1. Deduplicates subscriptions with identical filters (reference counting)
 * 2. Deduplicates events using seen event IDs
 * 3. Supports IMMEDIATE and BUFFERED modes for event handling
 * 4. Provides clean lifecycle management
 *
 * Usage:
 *   const manager = SubscriptionManager.getInstance();
 *   manager.initialize(ndk, dispatch);
 *   const handle = manager.subscribe(config);
 *   handle.unsubscribe(); // when done
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
    private readonly MAX_SEEN_EVENTS = 10000;
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

        // EOSE timeout fallback
        setTimeout(() => {
            if (!managed.eoseReceived) {
                console.warn(`EOSE timeout for filter ${filterHash.substring(0, 50)}...`);
                this.handleEose(managed);
            }
        }, this.EOSE_TIMEOUT_MS);

        return managed;
    }

    /**
     * Handle incoming event
     */
    private handleEvent(managed: ManagedSubscription, event: NDKEvent): void {
        // Event deduplication - check both local and global
        if (managed.seenEventIds.has(event.id) || this.globalSeenEventIds.has(event.id)) {
            return;
        }

        // Mark as seen
        managed.seenEventIds.add(event.id);
        this.addToGlobalSeen(event.id);

        // Notify all subscribers based on their mode
        managed.callbacks.forEach((callbacks) => {
            if (callbacks.mode === EventHandlingMode.IMMEDIATE) {
                // Immediate mode: call the callback directly
                callbacks.onEvent?.(event);
            } else {
                // Buffered mode: store for later and update pending count
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

        managed.callbacks.forEach((callbacks) => {
            callbacks.onEose?.();
        });
    }

    /**
     * Buffer an event for later display
     */
    private bufferEvent(
        event: NDKEvent,
        resourceType: ResourceType,
        context?: SubscriptionContext
    ): void {
        const buffered: BufferedEvent = {
            id: event.id,
            event,
            resourceType,
            context,
            receivedAt: Date.now()
        };

        this.bufferedEvents.set(event.id, buffered);

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
     */
    flushBufferedEvents(
        resourceType: ResourceType,
        context?: SubscriptionContext,
        callback?: (event: NDKEvent) => void
    ): void {
        const toFlush: BufferedEvent[] = [];

        this.bufferedEvents.forEach((buffered, id) => {
            if (buffered.resourceType === resourceType) {
                // Check context match if provided
                if (!context || contextMatches(buffered.context, context)) {
                    toFlush.push(buffered);
                    this.bufferedEvents.delete(id);
                }
            }
        });

        // Sort by event timestamp (oldest first)
        toFlush.sort((a, b) => (a.event.created_at ?? 0) - (b.event.created_at ?? 0));

        // Process each buffered event
        toFlush.forEach((buffered) => {
            callback?.(buffered.event);
        });

        // Clear pending state in Redux
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
            if (buffered.resourceType === resourceType) {
                if (!context || contextMatches(buffered.context, context)) {
                    count++;
                }
            }
        });
        return count;
    }

    /**
     * Add event ID to global seen set with LRU-style cleanup
     */
    private addToGlobalSeen(eventId: string): void {
        this.globalSeenEventIds.add(eventId);

        // Cleanup when exceeding max
        if (this.globalSeenEventIds.size > this.MAX_SEEN_EVENTS) {
            const toDelete = this.globalSeenEventIds.size - this.MAX_SEEN_EVENTS;
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
