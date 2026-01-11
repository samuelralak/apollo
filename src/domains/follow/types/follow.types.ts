/**
 * NIP-02 Follow List Types
 *
 * Kind 3 is a replaceable event containing the user's contact/follow list.
 * Uses `p` tags: ["p", <pubkey>, <relay_url?>, <petname?>]
 */

/**
 * Represents a user's follow list (kind 3 event)
 */
export interface FollowList {
    /** Event ID from Nostr */
    eventId: string;
    /** Owner's pubkey */
    pubkey: string;
    /** Unix timestamp for conflict resolution */
    createdAt: number;
    /** Array of followed pubkeys */
    followedPubkeys: string[];
}

/**
 * Redux state for the current user's follow list
 */
export interface FollowState {
    /** Current user's follow list (null if not loaded) */
    list: FollowList | null;
    /** Loading state */
    loading: boolean;
    /** Pending operations for optimistic updates: pubkey -> operation */
    pendingOperations: Record<string, 'add' | 'remove'>;
    /** Whether initial load is complete (EOSE received) */
    initialized: boolean;
}

/**
 * Payload for follow operation revert
 */
export interface FollowOperationPayload {
    pubkey: string;
    operation: 'add' | 'remove';
}

/**
 * Extended follow info with relay hint (from p tag)
 */
export interface FollowRef {
    pubkey: string;
    relayUrl?: string;
    petname?: string;
}
