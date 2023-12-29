import {PlayIcon} from "@heroicons/react/24/outline";
import {useContext} from "react";
import {NDKContext} from "../NDKProvider.tsx";
import {NDKKind} from "@nostr-dev-kit/ndk";

enum VoteKind {
    UPVOTE = '+',
    DOWNVOTE = '-'
}

const Votes = ({kind, eventId, pubkey, ref}: { kind: NDKKind, eventId: string, pubkey: string, ref?: string }) => {
    const {publishEvent} = useContext(NDKContext) as NDKContext

    const onVote = async (voteKind: VoteKind) => {
        const refTag = ref ? [["e", ref]] : []
        await publishEvent(7, voteKind, [
            ...refTag,
            ["e", eventId],
            ["p", pubkey],
            ["k", `${kind}`]])
    }

    return (
        <div className="w-10 flex flex-col items-center">
            <PlayIcon
                className="h-6 -rotate-90 text-slate-400 cursor-pointer"
                onClick={() => onVote(VoteKind.UPVOTE)}
            />

            <p className="w-full text-center font-medium text-xl text-slate-500">0</p>

            <PlayIcon
                className="h-6 rotate-90 text-slate-400 cursor-pointer"
                onClick={() => onVote(VoteKind.DOWNVOTE)}
            />
        </div>
    )
}

export default Votes
