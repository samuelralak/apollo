import { NDKEvent } from "@nostr-dev-kit/ndk";
import { tagFromEvents } from "../../../utils";
import { safeGetTag, safeGetAllTags, safeGetCoordinateIdentifier } from "../../../utils/tags";
import type { Question } from "../types/question.types";

// Extract pubkeys from p tags (supports both old and new formats)
// Old format: ["p", pubkey, "", "mention"]
// New format: ["p", pubkey] (standard NIP-27 compatible)
const extractMentionedPubkeys = (eventTags: string[][], authorPubkey: string): string[] => {
    return eventTags
        .filter(tag => tag[0] === 'p' && tag[1] && tag[1] !== authorPubkey)  // All p tags except author
        .map(tag => tag[1])
        .filter(Boolean);
};

export const questionTransformer = (event: NDKEvent): Question => {
    const tags = tagFromEvents(event.tags);

    // Get accepted answer info from tags
    const acceptedAnswerId = safeGetCoordinateIdentifier(tags);
    const acceptedAnswerEventId = safeGetTag(tags, "accepted_answer");

    // Get mentioned users (excluding the author)
    const mentionedPubkeys = extractMentionedPubkeys(event.tags, event.pubkey);

    return {
        id: safeGetTag(tags, 'd') ?? '',
        eventId: event.id,
        title: safeGetTag(tags, 'title') ?? '',
        description: event.content,
        category: safeGetTag(tags, 'category') ?? safeGetTag(tags, 'l') ?? '',
        tags: safeGetAllTags(tags, 't'),
        createdAt: event.created_at,
        acceptedAnswerEventId,
        acceptedAnswerId,
        mentionedPubkeys: mentionedPubkeys.length > 0 ? mentionedPubkeys : undefined,
        user: {
            pubkey: event.pubkey
        }
    };
}

// Keep backwards-compatible name
export const transformer = questionTransformer;
