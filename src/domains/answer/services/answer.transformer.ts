import { NDKEvent } from "@nostr-dev-kit/ndk";
import { tagFromEvents } from "../../../utils";
import type { Answer } from "../types/answer.types";

export const answerTransformer = (event: NDKEvent): Answer => {
    const tags = tagFromEvents(event.tags)

    return {
        id: tags['d'][0],
        description: event.content,
        createdAt: event.created_at!,
        questionId: tags['a'][0].split(':')[2],
        referenceEventId: tags['e'][0],
        eventId: event.id,
        user: {
            pubkey: event.pubkey
        }
    }
}

// Keep backwards-compatible name
export const transformer = answerTransformer;
