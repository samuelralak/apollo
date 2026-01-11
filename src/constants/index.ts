import {NDKKind} from "@nostr-dev-kit/ndk";

const constants: {
    questionKind: NDKKind;
    answerKind: NDKKind;
    voteKind: NDKKind;
    noteKind: NDKKind;
    shareKind: NDKKind;
    bookmarkListKind: NDKKind;
    secureStorageKey: string;
    explicitRelays: string[];
    searchRelays: string[];
    defaultZapAmount: number;
} = {
    noteKind: 1,
    shareKind: 9802,
    bookmarkListKind: 10003,
    questionKind: parseInt(import.meta.env.VITE_QUESTION_KIND),
    answerKind:  parseInt(import.meta.env.VITE_ANSWER_KIND),
    voteKind:  parseInt(import.meta.env.VITE_VOTE_KIND),
    secureStorageKey: '_heimdall',
    explicitRelays: (import.meta.env.VITE_EXPLICIT_RELAYS ?? "wss://relay.damus.io,wss://relay.nostr.band").split(','),
    // NIP-50 search relays - see architecture/search-relays.md
    searchRelays: (import.meta.env.VITE_SEARCH_RELAYS ?? "wss://relay.nostr.band,wss://relay.noswhere.com").split(','),
    defaultZapAmount: 21
}

export default constants
