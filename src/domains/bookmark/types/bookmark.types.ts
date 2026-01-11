/**
 * Represents a bookmark list event (NIP-51 kind 10003)
 * Each user has ONE bookmark list that gets replaced on each update
 */
export interface BookmarkList {
    /** Event ID of the kind 10003 event */
    eventId: string;
    /** User's pubkey who owns this list */
    pubkey: string;
    /** Unix timestamp when the event was created */
    createdAt: number;
    /** Set of bookmarked question coordinates (format: "30050:pubkey:identifier") */
    bookmarkedCoordinates: string[];
}

/**
 * Individual bookmark reference extracted from tags
 */
export interface BookmarkRef {
    /** Full coordinate string: "30050:pubkey:identifier" */
    coordinate: string;
    /** Parsed question kind */
    kind: number;
    /** Question author's pubkey */
    questionPubkey: string;
    /** Question identifier (UUID) */
    questionId: string;
}

/**
 * State shape for bookmark slice
 */
export interface BookmarkState {
    /** User's current bookmark list (null if not loaded or logged out) */
    list: BookmarkList | null;
    /** Loading state */
    loading: boolean;
    /** Optimistic updates pending confirmation */
    pendingOperations: Record<string, 'add' | 'remove'>;
    /** Whether initial load is complete */
    initialized: boolean;
}

/**
 * Payload for optimistic bookmark operations
 */
export interface BookmarkOperationPayload {
    /** Question coordinate to add/remove */
    coordinate: string;
    /** Operation type */
    operation: 'add' | 'remove';
}
