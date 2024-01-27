import {NDKEvent} from "@nostr-dev-kit/ndk";
import {tagFromEvents} from "../utils";

export default interface Comment {
    id: string;
    content: string;
    pubkey: string;
    createdAt: number;
    parentId: string;
    isReplaceable: boolean;
    participants: string[];
}

export const transformer = (event: NDKEvent): Comment => {
    const tags = tagFromEvents(event.tags)

    return {
        id: event.id,
        content: event.content,
        pubkey: event.pubkey,
        createdAt: event.created_at!,
        participants: tags['p'],
        isReplaceable: false,
        parentId: tags['a'][0].split(':')[2],
    }
}
