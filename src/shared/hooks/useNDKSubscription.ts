import type { NDKEvent, NDKFilter, NDKSubscriptionOptions } from "@nostr-dev-kit/ndk";
import { useCallback, useEffect, useMemo, useRef } from "react";
import {
    SubscriptionManager,
    EventHandlingMode,
    ResourceType,
    hashFilter,
    generateSubscriptionId,
    type SubscriptionContext,
    type SubscriptionHandle
} from "../../lib/subscriptions";

interface UseNDKSubscriptionOptions {
    /** NDK subscription options */
    ndkOptions?: NDKSubscriptionOptions;
    /** How to handle incoming events (default: IMMEDIATE) */
    mode?: EventHandlingMode;
    /** Resource type for proper routing */
    resourceType?: ResourceType;
    /** Context for scoped subscriptions (e.g., parentId for answers) */
    context?: SubscriptionContext;
    /** Whether the subscription is enabled (default: true) */
    enabled?: boolean;
}

/**
 * Hook for subscribing to Nostr events via the centralized SubscriptionManager.
 *
 * Features:
 * - Automatic deduplication of identical filters
 * - Proper cleanup on unmount
 * - Stable callback references (no stale closures)
 * - Support for IMMEDIATE and BUFFERED modes
 *
 * @param filters - NDK filter(s) to subscribe to
 * @param onEvent - Callback when an event is received (for IMMEDIATE mode)
 * @param onEose - Callback when EOSE is received
 * @param options - Additional subscription options
 */
const useNDKSubscription = (
    filters: NDKFilter | NDKFilter[],
    onEvent?: (event: NDKEvent) => void,
    onEose?: () => void,
    options: UseNDKSubscriptionOptions = {}
): void => {
    const {
        ndkOptions,
        mode = EventHandlingMode.IMMEDIATE,
        resourceType = ResourceType.QUESTION,
        context,
        enabled = true
    } = options;

    // Store callbacks in refs to avoid stale closures
    const onEventRef = useRef(onEvent);
    const onEoseRef = useRef(onEose);

    // Keep refs updated
    useEffect(() => {
        onEventRef.current = onEvent;
    }, [onEvent]);

    useEffect(() => {
        onEoseRef.current = onEose;
    }, [onEose]);

    // Stable callback wrappers
    const handleEvent = useCallback((event: NDKEvent) => {
        onEventRef.current?.(event);
    }, []);

    const handleEose = useCallback(() => {
        onEoseRef.current?.();
    }, []);

    // Memoize filter hash to detect actual filter changes
    const filterHash = useMemo(() => hashFilter(filters), [filters]);

    // Generate stable subscription ID per component instance
    // Using == null pattern for safe lazy initialization during render
    const subscriptionIdRef = useRef<string | null>(null);
    if (subscriptionIdRef.current == null) {
        subscriptionIdRef.current = generateSubscriptionId('hook');
    }

    // Track subscription handle for cleanup
    const handleRef = useRef<SubscriptionHandle | null>(null);

    useEffect(() => {
        const manager = SubscriptionManager.getInstance();

        // Don't subscribe if disabled or manager not initialized
        if (!enabled || !manager.isInitialized()) {
            return;
        }

        // Subscribe through the manager
        handleRef.current = manager.subscribe({
            id: subscriptionIdRef.current!,
            filters,
            options: ndkOptions,
            mode,
            resourceType,
            context,
            onEvent: handleEvent,
            onEose: handleEose
        });

        // Cleanup on unmount or when dependencies change
        return () => {
            handleRef.current?.unsubscribe();
            handleRef.current = null;
        };
    }, [filterHash, enabled, mode, resourceType, context, ndkOptions, handleEvent, handleEose]);
};

export default useNDKSubscription;

// Re-export types for convenience
export { EventHandlingMode, ResourceType };
export type { UseNDKSubscriptionOptions };
