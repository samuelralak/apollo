import {NDKEvent} from "@nostr-dev-kit/ndk";
import {tagFromEvents} from "../utils";

export interface Answer {
    id?: string;
    description: string;
    createdAt: number;
    questionId: string;
    referenceEventId: string;
    eventId: string;
    user: {
        pubkey: string
    }
}

export const transformer = (event: NDKEvent): Answer => {
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
