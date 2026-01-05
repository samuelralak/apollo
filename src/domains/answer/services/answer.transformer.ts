import { NDKEvent } from "@nostr-dev-kit/ndk";
import { tagFromEvents } from "../../../utils";
import { safeGetTag, safeGetCoordinateIdentifier } from "../../../utils/tags";
import type { Answer } from "../types/answer.types";

export const answerTransformer = (event: NDKEvent): Answer => {
    const tags = tagFromEvents(event.tags);

    return {
        id: safeGetTag(tags, 'd') ?? '',
        description: event.content,
        createdAt: event.created_at!,
        questionId: safeGetCoordinateIdentifier(tags) ?? '',
        referenceEventId: safeGetTag(tags, 'e') ?? '',
        eventId: event.id,
        user: {
            pubkey: event.pubkey
        }
    };
}

// Keep backwards-compatible name
export const transformer = answerTransformer;
