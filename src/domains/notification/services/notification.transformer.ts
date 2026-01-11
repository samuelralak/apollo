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
 * Check if event is a comment on user's Q&A content
 * Returns true if the event has an 'a' tag pointing to Q&A content authored by the user
 */
const isCommentOnUserContent = (event: NDKEvent, userPubkey: string): boolean => {
    const tags = tagFromEvents(event.tags);
    const coordinate = safeGetTag(tags, 'a');

    if (!coordinate) return false;

    const parsed = parseCoordinate(coordinate);
    if (!parsed) return false;

    // Check if it's Q&A content (question or answer) authored by the user
    const isQAKind = parsed.kind === constants.questionKind || parsed.kind === constants.answerKind;
    const isUserContent = parsed.pubkey === userPubkey;

    return isQAKind && isUserContent;
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
        // COMMENT: Event references Q&A content authored by the user
        // MENTION: User is tagged but it's not a comment on their Q&A content
        if (isUserTagged(event, userPubkey)) {
            return isCommentOnUserContent(event, userPubkey)
                ? NotificationType.COMMENT
                : NotificationType.MENTION;
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

    // Source requirements vary by notification type:
    // - FOLLOW: No source required (it's about the follower, not a specific content)
    // - ZAP: No source required (can zap user directly without specific event)
    // - MENTION: No source required (can mention user without referencing specific content)
    // - Others: Source required (must reference some content)
    const sourceNotRequired =
        type === NotificationType.FOLLOW ||
        type === NotificationType.ZAP ||
        type === NotificationType.MENTION;
    if (!source && !sourceNotRequired) {
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

    // Ensure valid timestamp (Nostr events should always have created_at)
    const createdAt = event.created_at && event.created_at > 0
        ? event.created_at
        : Math.floor(Date.now() / 1000);

    const notification: Notification = {
        id: notificationId,
        type,
        category: getCategoryFromType(type),
        actors: [actor],
        source: source ?? {
            eventId: event.id,
            resourceType: 'question'
        },
        createdAt,
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
