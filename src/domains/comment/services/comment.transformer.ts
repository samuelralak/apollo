import { NDKEvent } from "@nostr-dev-kit/ndk";
import { tagFromEvents } from "../../../utils";
import { safeGetAllTags, safeGetCoordinateIdentifier } from "../../../utils/tags";
import type { Comment } from "../types/comment.types";

export const commentTransformer = (event: NDKEvent): Comment => {
    const tags = tagFromEvents(event.tags);

    return {
        id: event.id,
        content: event.content,
        pubkey: event.pubkey,
        createdAt: event.created_at!,
        participants: safeGetAllTags(tags, 'p'),
        isReplaceable: false,
        parentId: safeGetCoordinateIdentifier(tags) ?? '',
    };
}

// Keep backwards-compatible name
export const transformer = commentTransformer;
