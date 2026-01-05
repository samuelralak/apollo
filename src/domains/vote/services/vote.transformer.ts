import { NDKEvent } from "@nostr-dev-kit/ndk";
import { tagFromEvents } from "../../../utils";
import type { Vote } from "../types/vote.types";
import { VoteType } from "../types/vote.types";

export const voteTransformer = (event: NDKEvent): Vote => {
    const tags = tagFromEvents(event.tags)

    return {
        vote: event.content as VoteType,
        eventId: event.id,
        pubkey: event.pubkey,
        createdAt: event.created_at!,
        referenceEventId: tags['e'][tags['e'].length - 1],
        resourceId: (tags['a'] ?? [])[0]?.split(':')[2]
    }
}

// Keep backwards-compatible name
export const transformer = voteTransformer;
