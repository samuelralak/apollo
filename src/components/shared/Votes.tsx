import {ArrowDownCircleIcon, ArrowUpCircleIcon} from "@heroicons/react/24/outline";
import {useContext} from "react";
import {NDKContext} from "../NDKProvider.tsx";
import {NDKKind} from "@nostr-dev-kit/ndk";
import {useSelector} from "react-redux";
import {RootState} from "../../store";

enum VoteKind {
    UPVOTE = '+',
    DOWNVOTE = '-'
}

const Votes = ({kind, eventId, pubkey, ref}: { kind: NDKKind, eventId: string, pubkey: string, ref?: string }) => {
    const {publishEvent} = useContext(NDKContext) as NDKContext
    const isAuthenticated = useSelector((state: RootState) => state.auth.isLoggedIn);

    const onVote = async (voteKind: VoteKind) => {
        if (isAuthenticated) {
            const refTag = ref ? [["e", ref]] : []
            await publishEvent(7, voteKind, [
                ...refTag,
                ["e", eventId],
                ["p", pubkey],
                ["k", `${kind}`]])
        }
    }

    return (
        <div className="w-8 flex flex-col items-center">
            <ArrowUpCircleIcon
                className="h-8 w-8 text-slate-400 cursor-pointer"
                onClick={() => onVote(VoteKind.UPVOTE)}
            />

            <p className="w-full text-center font-medium text-lg text-slate-500">0</p>

            <ArrowDownCircleIcon
                className="h-8 w-8 text-slate-400 cursor-pointer"
                onClick={() => onVote(VoteKind.DOWNVOTE)}
            />
        </div>
    )
}

export default Votes
