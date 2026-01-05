import { NDKEvent } from "@nostr-dev-kit/ndk";
import { tagFromEvents } from "../../../utils";
import type { Comment } from "../types/comment.types";

export const commentTransformer = (event: NDKEvent): Comment => {
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

// Keep backwards-compatible name
export const transformer = commentTransformer;
