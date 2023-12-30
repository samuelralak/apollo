import {NDKEvent} from "@nostr-dev-kit/ndk";
import {tagFromEvents} from "../utils";

export enum VoteType {
    UPVOTE = '+',
    DOWNVOTE = '-'
}


export default interface Vote {
    vote: VoteType;
    eventId: string;
    pubkey: string;
    createdAt: number;
    referenceEventId: string
}

export const transformer = (event: NDKEvent): Vote => {
    const tags = tagFromEvents(event.tags)

    return {
        vote: event.content as VoteType,
        eventId: event.id,
        pubkey: event.pubkey,
        createdAt: event.created_at!,
        referenceEventId: tags['e'][tags['e'].length - 1]
    }
}
