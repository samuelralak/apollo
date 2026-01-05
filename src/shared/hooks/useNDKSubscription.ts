import type { NDKEvent, NDKFilter, NDKSubscriptionOptions } from "@nostr-dev-kit/ndk";
import { useMemo, useRef } from "react";
import { useSyncedRef, useConditionalEffect } from "@react-hookz/web";
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

    // Synced refs to avoid stale closures and unnecessary re-subscriptions
    const onEventRef = useSyncedRef(onEvent);
    const onEoseRef = useSyncedRef(onEose);
    const contextRef = useSyncedRef(context);
    const ndkOptionsRef = useSyncedRef(ndkOptions);
    const filtersRef = useSyncedRef(filters);

    // Memoize filter hash to detect actual filter changes
    const filterHash = useMemo(() => hashFilter(filters), [filters]);

    // Generate stable subscription ID per component instance
    const subscriptionIdRef = useRef<string | null>(null);
    if (subscriptionIdRef.current == null) {
        subscriptionIdRef.current = generateSubscriptionId('hook');
    }

    // Track subscription handle for cleanup
    const handleRef = useRef<SubscriptionHandle | null>(null);

    const managerInitialized = SubscriptionManager.getInstance().isInitialized();

    useConditionalEffect(
        () => {
            const manager = SubscriptionManager.getInstance();

            handleRef.current = manager.subscribe({
                id: subscriptionIdRef.current!,
                filters: filtersRef.current,
                options: ndkOptionsRef.current,
                mode,
                resourceType,
                context: contextRef.current,
                onEvent: (event) => onEventRef.current?.(event),
                onEose: () => onEoseRef.current?.()
            });

            return () => {
                handleRef.current?.unsubscribe();
                handleRef.current = null;
            };
        },
        [filterHash, mode, resourceType],
        [enabled, managerInitialized]
    );
};

export default useNDKSubscription;

// Re-export types for convenience
export { EventHandlingMode, ResourceType };
export type { UseNDKSubscriptionOptions };
