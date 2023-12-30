import {NDKKind} from "@nostr-dev-kit/ndk";

const constants: {
    questionKind: NDKKind;
    answerKind: NDKKind;
    secureStorageKey: string;
} = {
    questionKind: parseInt(import.meta.env.VITE_QUESTION_KIND),
    answerKind:  parseInt(import.meta.env.VITE_ANSWER_KIND),
    secureStorageKey: '_heimdall'
}

export default constants
