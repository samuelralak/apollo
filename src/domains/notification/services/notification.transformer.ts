import type { NDKEvent } from "@nostr-dev-kit/ndk";
import { tagFromEvents } from "../../../utils";
import { safeGetTag, safeGetLastTag, parseCoordinate } from "../../../utils/tags";
import constants from "../../../constants";
import type { Notification, NotificationSource, NotificationActor } from "../types/notification.types";
import { NotificationType, NotificationCategory } from "../types/notification.types";

/**
 * Determine notification category from type
 */
const getCategoryFromType = (type: NotificationType): NotificationCategory => {
    switch (type) {
        case NotificationType.ANSWER:
        case NotificationType.COMMENT:
        case NotificationType.ACCEPTED_ANSWER:
        case NotificationType.MENTION:
            return NotificationCategory.QA;
        case NotificationType.UPVOTE:
        case NotificationType.DOWNVOTE:
            return NotificationCategory.ENGAGEMENT;
        case NotificationType.FOLLOW:
            return NotificationCategory.SOCIAL;
        case NotificationType.ZAP:
            return NotificationCategory.ZAPS;
        default:
            return NotificationCategory.QA;
    }
};

/**
 * Result of extracting source information
 */
interface SourceExtractionResult {
    source: NotificationSource | null;
    isQARelated: boolean;
}

/**
 * Extract source information from event tags
 * Also determines if the event is related to our Q&A platform
 */
const extractSource = (event: NDKEvent): SourceExtractionResult => {
    const tags = tagFromEvents(event.tags);
    let isQARelated = false;

    // Try to get addressable coordinate first (for questions/answers)
    const coordinate = safeGetTag(tags, 'a');
    if (coordinate) {
        const parsed = parseCoordinate(coordinate);
        if (parsed) {
            // Check if this references our Q&A kinds
            if (parsed.kind === constants.questionKind || parsed.kind === constants.answerKind) {
                isQARelated = true;
            }

            let resourceType: 'question' | 'answer' | 'comment' = 'question';
            if (parsed.kind === constants.answerKind) {
                resourceType = 'answer';
            }

            return {
                source: {
                    eventId: safeGetLastTag(tags, 'e') ?? '',
                    coordinate,
                    resourceType,
                    resourceId: parsed.identifier
                },
                isQARelated
            };
        }
    }

    // Fall back to event reference
    const refEventId = safeGetLastTag(tags, 'e');
    if (refEventId) {
        return {
            source: {
                eventId: refEventId,
                resourceType: 'question'
            },
            isQARelated: false // Without coordinate, we can't confirm it's Q&A related
        };
    }

    return { source: null, isQARelated: false };
};

/**
 * Extract zap amount from kind 9735 event (NIP-57)
 */
const extractZapAmount = (event: NDKEvent): number | undefined => {
    const tags = tagFromEvents(event.tags);
    const bolt11 = safeGetTag(tags, 'bolt11');

    if (bolt11) {
        // Parse bolt11 invoice for amount
        // Format: lnbc<amount><unit>...
        const match = bolt11.match(/lnbc(\d+)([munp]?)/i);
        if (match) {
            const value = parseInt(match[1], 10);
            const unit = match[2]?.toLowerCase() || '';

            // Convert to sats
            switch (unit) {
                case 'm': return value * 100000;      // milli-BTC to sats
                case 'u': return value * 100;         // micro-BTC to sats
                case 'n': return Math.floor(value / 10); // nano-BTC to sats
                case 'p': return Math.floor(value / 10000); // pico-BTC to sats
                default: return value * 100000000;    // BTC to sats
            }
        }
    }

    // Alternative: check description tag for amount (from zap request)
    const descriptionTag = safeGetTag(tags, 'description');
    if (descriptionTag) {
        try {
            const zapRequest = JSON.parse(descriptionTag);
            const amountTag = zapRequest.tags?.find((t: string[]) => t[0] === 'amount');
            if (amountTag && amountTag[1]) {
                return Math.floor(parseInt(amountTag[1], 10) / 1000); // msats to sats
            }
        } catch {
            // Ignore parse errors
        }
    }

    return undefined;
};

/**
 * Check if event is a mention notification (has p tag with "mention" marker)
 */
const isMentionEvent = (event: NDKEvent, userPubkey: string): boolean => {
    return event.tags.some(
        tag => tag[0] === 'p' && tag[1] === userPubkey && tag[3] === 'mention'
    );
};

/**
 * Check if user is tagged in event's p tags
 */
const isUserTagged = (event: NDKEvent, userPubkey: string): boolean => {
    return event.tags.some(
        tag => tag[0] === 'p' && tag[1] === userPubkey
    );
};

/**
 * Determine notification type from event kind and content
 */
const determineNotificationType = (
    event: NDKEvent,
    userPubkey: string
): NotificationType | null => {
    const kind = event.kind as number;

    // Zap receipt
    if (kind === constants.zapReceiptKind) {
        return NotificationType.ZAP;
    }

    // Answer to question
    if (kind === constants.answerKind) {
        return NotificationType.ANSWER;
    }

    // Vote (upvote/downvote)
    if (kind === constants.voteKind) {
        return event.content === '+' ? NotificationType.UPVOTE : NotificationType.DOWNVOTE;
    }

    // Kind 1 (notes) - could be comment or mention
    if (kind === constants.noteKind) {
        // Check for explicit mention marker
        if (isMentionEvent(event, userPubkey)) {
            return NotificationType.MENTION;
        }
        // Default to comment if user is tagged
        if (isUserTagged(event, userPubkey)) {
            return NotificationType.COMMENT;
        }
    }

    // Follow (kind 3) - deferred to Phase 2
    if (kind === constants.contactListKind) {
        return NotificationType.FOLLOW;
    }

    return null;
};

/**
 * Transform an NDK event into a Notification
 * Returns null if the event cannot be transformed
 *
 * @param event - The NDK event to transform
 * @param userPubkey - The current user's pubkey (to filter out own events)
 */
export const notificationTransformer = (
    event: NDKEvent,
    userPubkey: string
): Notification | null => {
    // Skip own events - no self-notifications
    if (event.pubkey === userPubkey) {
        return null;
    }

    // Verify user is tagged in the event (except for follow events)
    const kind = event.kind as number;
    if (kind !== constants.contactListKind && !isUserTagged(event, userPubkey)) {
        return null;
    }

    // Determine notification type
    const type = determineNotificationType(event, userPubkey);
    if (type === null) {
        return null;
    }

    // Extract source (what was interacted with) and Q&A relation
    const { source, isQARelated } = extractSource(event);

    // For follow events, source is not required
    if (!source && type !== NotificationType.FOLLOW) {
        return null;
    }

    // Our custom kinds (answerKind, voteKind) are always Q&A related
    // - answerKind events will have type === ANSWER
    // - voteKind is Apollo-specific, only used for Q&A voting
    const finalIsQARelated = isQARelated ||
        type === NotificationType.ANSWER ||
        kind === constants.voteKind;

    const actor: NotificationActor = {
        pubkey: event.pubkey
    };

    // For follow events, use actor pubkey as part of ID to deduplicate
    // (kind 3 is replaceable, so we only want latest follow per user)
    const notificationId = type === NotificationType.FOLLOW
        ? `follow:${event.pubkey}`
        : event.id;

    const notification: Notification = {
        id: notificationId,
        type,
        category: getCategoryFromType(type),
        actors: [actor],
        source: source ?? {
            eventId: event.id,
            resourceType: 'question'
        },
        createdAt: event.created_at ?? Math.floor(Date.now() / 1000),
        isQARelated: finalIsQARelated
    };

    // Add zap amount if applicable
    if (type === NotificationType.ZAP) {
        notification.zapAmount = extractZapAmount(event);
    }

    // Add vote value if applicable
    if (type === NotificationType.UPVOTE || type === NotificationType.DOWNVOTE) {
        notification.voteValue = event.content as '+' | '-';
    }

    return notification;
};
