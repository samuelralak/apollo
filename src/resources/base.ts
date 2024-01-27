export default interface BaseResource {
    isReplaceable: boolean;
    pubkey: string;
    parentId?: string;
    user?: {
        pubkey: string;
    }
}
