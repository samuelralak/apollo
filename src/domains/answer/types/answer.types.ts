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
