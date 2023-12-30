import {NDKKind} from "@nostr-dev-kit/ndk";

const constants: {
    questionKind: NDKKind;
    answerKind: NDKKind;
    voteKind: NDKKind;
    secureStorageKey: string;
} = {
    questionKind: parseInt(import.meta.env.VITE_QUESTION_KIND),
    answerKind:  parseInt(import.meta.env.VITE_ANSWER_KIND),
    voteKind:  parseInt(import.meta.env.VITE_VOTE_KIND),
    secureStorageKey: '_heimdall'
}

export default constants
