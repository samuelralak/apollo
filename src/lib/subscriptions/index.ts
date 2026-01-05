/**
 * Centralized Subscription Management System
 *
 * Provides deduplication, reference counting, and buffered event handling
 * for Nostr subscriptions.
 */

export { default as SubscriptionManager } from "./SubscriptionManager";

export {
    EventHandlingMode,
    ResourceType,
    type SubscriptionConfig,
    type SubscriptionHandle,
    type SubscriptionContext,
    type SubscriptionCallbacks,
    type ManagedSubscription,
    type BufferedEvent,
    type PendingEventsState,
    type SubscriptionStats
} from "./types";

export {
    normalizeFilter,
    hashFilter,
    filtersMatch,
    generateSubscriptionId,
    contextMatches
} from "./utils";
