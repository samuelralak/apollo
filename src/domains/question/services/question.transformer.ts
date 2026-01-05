import { NDKEvent } from "@nostr-dev-kit/ndk";
import { tagFromEvents } from "../../../utils";
import type { Question } from "../types/question.types";

export const questionTransformer = (event: NDKEvent): Question => {
    let content: string;

    const tags = tagFromEvents(event.tags)
    const acceptedAnswerId = (tags['a'] ?? [])[0]?.split(':')[2]
    const acceptedAnswerEvent = (tags["accepted_answer"] ?? [])[0]

    try {
        JSON.parse(event.content)
        content = ''
    } catch {
        content = event.content
    }

    return {
        id: (tags['d'] ?? [])[0],
        eventId: event.id,
        title: (tags['title'] ?? [])[0],
        description: content,
        category: (tags['category'] ?? tags['l'] ?? [])[0],
        tags: (tags['t'] ?? []),
        createdAt: event.created_at,
        acceptedAnswerEventId: acceptedAnswerEvent,
        acceptedAnswerId: acceptedAnswerId,
        user: {
            pubkey: event.pubkey
        }
    }
}

// Keep backwards-compatible name
export const transformer = questionTransformer;
