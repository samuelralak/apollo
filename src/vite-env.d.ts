/// <reference types="vite/client" />

interface Window {
    nostr?: {
        getPublicKey(): Promise<string>;
        signEvent(event: object): Promise<object>;
    };
}
