/**
 * Notification type categories
 */
export enum NotificationType {
    // Core Q&A
    ANSWER = 'answer',
    COMMENT = 'comment',
    ACCEPTED_ANSWER = 'accepted',
    MENTION = 'mention',

    // Engagement
    UPVOTE = 'upvote',
    DOWNVOTE = 'downvote',

    // Social
    FOLLOW = 'follow',

    // Lightning
    ZAP = 'zap'
}

/**
 * Notification category for grouping/filtering
 */
export enum NotificationCategory {
    QA = 'qa',
    ENGAGEMENT = 'engagement',
    SOCIAL = 'social',
    ZAPS = 'zaps'
}

/**
 * Source content reference (what was interacted with)
 */
export interface NotificationSource {
    /** Event ID of the source content */
    eventId: string;
    /** Addressable coordinate if applicable (kind:pubkey:id) */
    coordinate?: string;
    /** Resource type: question, answer, comment */
    resourceType: 'question' | 'answer' | 'comment';
    /** Resource identifier (d tag) */
    resourceId?: string;
    /** Preview text from source (truncated) */
    preview?: string;
}

/**
 * Actor who triggered the notification
 */
export interface NotificationActor {
    pubkey: string;
}

/**
 * Unified notification model
 */
export interface Notification {
    /** Unique notification ID (event ID of the triggering event) */
    id: string;
    /** Notification type */
    type: NotificationType;
    /** Category for filtering */
    category: NotificationCategory;
    /** User(s) who triggered this notification */
    actors: NotificationActor[];
    /** What was interacted with */
    source: NotificationSource;
    /** Unix timestamp */
    createdAt: number;
    /** Zap-specific: amount in sats */
    zapAmount?: number;
    /** Vote-specific: vote value */
    voteValue?: '+' | '-';
    /** Whether this notification is related to Q&A content (vs general Nostr) */
    isQARelated: boolean;
}

/**
 * Notification settings per category
 */
export interface NotificationSettings {
    /** Enable/disable by category */
    enabled: Record<NotificationCategory, boolean>;
    /** Show in-app notifications */
    showInApp: boolean;
    /** Aggregate similar notifications */
    aggregateSimilar: boolean;
}

/**
 * Redux state for notifications
 */
export interface NotificationState {
    /** All notifications, keyed by ID for O(1) lookup */
    byId: Record<string, Notification>;
    /** Ordered list of notification IDs (newest first) */
    ids: string[];
    /** Timestamp of last read (for unread calculation) */
    lastReadTimestamp: number;
    /** Loading state */
    loading: boolean;
    /** Whether initial load is complete */
    initialized: boolean;
    /** User notification settings */
    settings: NotificationSettings;
    /** Error message if subscription failed */
    error: string | null;
}

/**
 * localStorage keys
 */
export const NOTIFICATION_STORAGE_KEYS = {
    LAST_READ: 'apollo:notifications:lastRead',
    SETTINGS: 'apollo:notifications:settings'
} as const;

/**
 * Default notification settings
 */
export const DEFAULT_NOTIFICATION_SETTINGS: NotificationSettings = {
    enabled: {
        [NotificationCategory.QA]: true,
        [NotificationCategory.ENGAGEMENT]: true,
        [NotificationCategory.SOCIAL]: true,
        [NotificationCategory.ZAPS]: true
    },
    showInApp: true,
    aggregateSimilar: true
};
