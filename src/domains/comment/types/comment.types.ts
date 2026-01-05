export interface Comment {
    id: string;
    content: string;
    pubkey: string;
    createdAt: number;
    parentId: string;
    isReplaceable: boolean;
    participants: string[];
}
