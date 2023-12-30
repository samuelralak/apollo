import {NDKEvent} from "@nostr-dev-kit/ndk";
import {tagFromEvents} from "../utils";

export default interface Question {
    id: string;
    title: string;
    description: string;
    tags: string[];
    category: string;
    createdAt?: number;
    eventId: string;
    user: {
        pubkey: string
    };
}

export const transformer = (event: NDKEvent) => {
    let content: string;
    const tags = tagFromEvents(event.tags)

    try {
        JSON.parse(event.content)
        content = ''
    } catch (_) {
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
        user: {
            pubkey: event.pubkey
        }
    } as Question
}
