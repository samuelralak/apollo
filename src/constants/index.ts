import {NDKKind} from "@nostr-dev-kit/ndk";

const constants: {
    questionKind: NDKKind;
    answerKind: NDKKind;
    voteKind: NDKKind;
    noteKind: NDKKind;
    shareKind: NDKKind;
    secureStorageKey: string;
    explicitRelays: string[];
    defaultZapAmount: number;
} = {
    noteKind: 1,
    shareKind: 9802,
    questionKind: parseInt(import.meta.env.VITE_QUESTION_KIND),
    answerKind:  parseInt(import.meta.env.VITE_ANSWER_KIND),
    voteKind:  parseInt(import.meta.env.VITE_VOTE_KIND),
    secureStorageKey: '_heimdall',
    explicitRelays: (import.meta.env.VITE_EXPLICIT_RELAYS ?? "wss://relay.nostrosity.com").split(' '),
    defaultZapAmount: 21
}

export default constants
