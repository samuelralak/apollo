export interface Answer {
    id?: string;
    description: string;
    accepted: boolean;
    createdAt?: string;
    questionId: string;
    user: {
        pubkey: string
    }
}
