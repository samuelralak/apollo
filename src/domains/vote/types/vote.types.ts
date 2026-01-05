export enum VoteType {
    UPVOTE = '+',
    DOWNVOTE = '-'
}

export interface Vote {
    vote: VoteType;
    eventId: string;
    pubkey: string;
    createdAt: number;
    referenceEventId: string;
    resourceId: string;
}
