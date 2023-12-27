export interface Answer {
    id?: string;
    description: string;
    createdAt: number;
    questionId: string;
    eventId: string;
    user: {
        pubkey: string
    }
}
