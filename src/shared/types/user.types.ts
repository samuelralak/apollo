export interface BaseResource {
    isReplaceable: boolean;
    pubkey: string;
    parentId?: string;
    user?: {
        pubkey: string;
    }
}

export interface User {
    pubkey: string;
}
