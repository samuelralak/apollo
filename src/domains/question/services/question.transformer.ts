import { NDKEvent } from "@nostr-dev-kit/ndk";
import { tagFromEvents } from "../../../utils";
import { safeGetTag, safeGetAllTags, safeGetCoordinateIdentifier } from "../../../utils/tags";
import type { Question } from "../types/question.types";

// Extract pubkeys from p tags with "mention" marker
const extractMentionedPubkeys = (eventTags: string[][]): string[] => {
    return eventTags
        .filter(tag => tag[0] === 'p' && tag[3] === 'mention')
        .map(tag => tag[1])
        .filter(Boolean);
};

export const questionTransformer = (event: NDKEvent): Question => {
    const tags = tagFromEvents(event.tags);

    // Get accepted answer info from tags
    const acceptedAnswerId = safeGetCoordinateIdentifier(tags);
    const acceptedAnswerEventId = safeGetTag(tags, "accepted_answer");

    // Get mentioned users
    const mentionedPubkeys = extractMentionedPubkeys(event.tags);

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
