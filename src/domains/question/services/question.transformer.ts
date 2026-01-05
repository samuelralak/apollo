import { NDKEvent } from "@nostr-dev-kit/ndk";
import { tagFromEvents } from "../../../utils";
import { safeGetTag, safeGetAllTags, safeGetCoordinateIdentifier } from "../../../utils/tags";
import type { Question } from "../types/question.types";

export const questionTransformer = (event: NDKEvent): Question => {
    const tags = tagFromEvents(event.tags);

    // Get accepted answer info from tags
    const acceptedAnswerId = safeGetCoordinateIdentifier(tags);
    const acceptedAnswerEventId = safeGetTag(tags, "accepted_answer");

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
        user: {
            pubkey: event.pubkey
        }
    };
}

// Keep backwards-compatible name
export const transformer = questionTransformer;
