import type { NDKEvent, NDKFilter, NDKSubscription, NDKSubscriptionOptions } from "@nostr-dev-kit/ndk";

/**
 * Mode for handling incoming events
 */
export enum EventHandlingMode {
    /** Events are immediately dispatched to Redux store */
    IMMEDIATE = 'immediate',
    /** Events are buffered for manual loading (Twitter-style "new items available") */
    BUFFERED = 'buffered'
}

/**
 * Resource types supported by the subscription manager
 */
export enum ResourceType {
    QUESTION = 'question',
    ANSWER = 'answer',
    VOTE = 'vote',
    COMMENT = 'comment',
    BOOKMARK = 'bookmark',
    FOLLOW = 'follow'
}

/**
 * Context information for subscriptions (parent relationships)
 */
export interface SubscriptionContext {
    /** Parent resource ID (e.g., questionId for answers) */
    parentId?: string;
    /** Parent resource pubkey */
    parentPubkey?: string;
    /** Additional metadata */
    metadata?: Record<string, unknown>;
}

/**
 * Configuration for a subscription request
 */
export interface SubscriptionConfig {
    /** Unique identifier for this subscription request */
    id: string;
    /** NDK filter(s) for the subscription */
    filters: NDKFilter | NDKFilter[];
    /** Optional NDK subscription options */
    options?: NDKSubscriptionOptions;
    /** Dynamic mode getter - allows mode changes without re-subscribing */
    getMode: () => EventHandlingMode;
    /** Callback for each event received */
    onEvent?: (event: NDKEvent) => void;
    /** Callback when EOSE is received */
    onEose?: () => void;
    /** Resource type for proper store routing */
    resourceType: ResourceType;
    /** Optional context (e.g., questionId for answers) */
    context?: SubscriptionContext;
}

/**
 * Callbacks for a specific subscriber
 */
export interface SubscriptionCallbacks {
    onEvent?: (event: NDKEvent) => void;
    onEose?: () => void;
    /** Dynamic mode getter - called on each event to determine handling */
    getMode: () => EventHandlingMode;
    resourceType: ResourceType;
    context?: SubscriptionContext;
}

/**
 * Internal representation of an active subscription
 */
export interface ManagedSubscription {
    /** Hash of the normalized filter for deduplication */
    filterHash: string;
    /** The actual NDK subscription */
    subscription: NDKSubscription;
    /** Number of components subscribed to this filter */
    refCount: number;
    /** Set of subscriber IDs */
    subscribers: Set<string>;
    /** Callbacks per subscriber */
    callbacks: Map<string, SubscriptionCallbacks>;
    /** When this subscription was created */
    createdAt: number;
    /** Event IDs already processed (for deduplication) - with insertion order for LRU */
    seenEventIds: Set<string>;
    /** Whether EOSE has been received */
    eoseReceived: boolean;
    /** EOSE timeout timer ID (for cleanup) */
    eoseTimeoutId?: ReturnType<typeof setTimeout>;
}

/**
 * Result of subscribing through the manager
 */
export interface SubscriptionHandle {
    /** Unique ID for this subscription */
    id: string;
    /** Unsubscribe function */
    unsubscribe: () => void;
}

/**
 * Target for a buffered event (supports multiple contexts per event)
 */
export interface BufferedEventTarget {
    resourceType: ResourceType;
    context?: SubscriptionContext;
}

/**
 * Buffered event with metadata - supports multiple targets to avoid collision
 */
export interface BufferedEvent {
    id: string;
    event: NDKEvent;
    targets: BufferedEventTarget[];
    receivedAt: number;
}

/**
 * State for pending (buffered) events in Redux
 */
export interface PendingEventsState {
    /** Pending questions */
    questions: {
        ids: string[];
        count: number;
        oldestTimestamp: number | null;
    };
    /** Pending answers by questionId */
    answers: Record<string, {
        ids: string[];
        count: number;
    }>;
    /** Pending votes by resourceId */
    votes: Record<string, {
        ids: string[];
        count: number;
    }>;
    /** Pending comments by parentId */
    comments: Record<string, {
        ids: string[];
        count: number;
    }>;
}

/**
 * Statistics about the subscription manager (for debugging/monitoring)
 */
export interface SubscriptionStats {
    activeSubscriptions: number;
    totalSubscribers: number;
    uniqueFilters: number;
    seenEventsCount: number;
    pendingEventsCount: number;
}
