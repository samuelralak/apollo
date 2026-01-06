/**
 * NIP-07 window.nostr type declaration
 * @see https://github.com/nostr-protocol/nips/blob/master/07.md
 */

interface Nip07Event {
    id?: string;
    pubkey?: string;
    created_at: number;
    kind: number;
    tags: string[][];
    content: string;
    sig?: string;
}

interface Nip07Nostr {
    getPublicKey(): Promise<string>;
    signEvent(event: Nip07Event): Promise<Nip07Event>;
    getRelays?(): Promise<Record<string, { read: boolean; write: boolean }>>;
    nip04?: {
        encrypt(pubkey: string, plaintext: string): Promise<string>;
        decrypt(pubkey: string, ciphertext: string): Promise<string>;
    };
    nip44?: {
        encrypt(pubkey: string, plaintext: string): Promise<string>;
        decrypt(pubkey: string, ciphertext: string): Promise<string>;
    };
}

declare global {
    interface Window {
        nostr?: Nip07Nostr;
    }
}

export {};
