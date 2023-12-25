export interface Question {
    id?: string;
    title: string;
    description: string;
    tags: string[];
    category: string;
    createdAt?: number;
    user?: {
        pubkey: string
    };
}
