import {ArrowDownCircleIcon, ArrowUpCircleIcon} from "@heroicons/react/24/outline";
import {useContext} from "react";
import {NDKContext} from "../NDKProvider.tsx";
import {NDKFilter, NDKKind} from "@nostr-dev-kit/ndk";
import {useDispatch, useSelector} from "react-redux";
import {AppDispatch, RootState} from "../../store";
import constants from "../../constants";
import useNDKSubscription from "../../hooks/useNDKSubscription.ts";
import Vote, {transformer as voteTransformer, VoteType} from "../../resources/vote.ts";
import {updateVote} from "../../features/vote/vote-slice.ts";
import {classNames} from "../../utils";

const voteActionClassName = (myVote: Vote, voteType: VoteType) =>
    classNames(
        myVote && myVote.vote === voteType
            ? 'text-green-500'
            : 'text-slate-400',
        'h-8 w-8 cursor-pointer'
    );

const Votes = ({kind, eventId, pubkey, ref}: { kind: NDKKind, eventId: string, pubkey: string, ref?: string }) => {
    const voteFilters = {kinds: [constants.voteKind], "#e": [eventId], "#p": [pubkey]}
    const {publishEvent} = useContext(NDKContext) as NDKContext
    const auth = useSelector((state: RootState) => state.auth);
    const vote = useSelector((state: RootState) => state.vote)[eventId];
    const dispatch = useDispatch() as AppDispatch
    const myVote = vote?.data[auth.userProfile?.pubkey ?? ""]

    const onVote = async (voteType: VoteType) => {
        if (auth.isLoggedIn) {
            const refTag = ref ? [["e", ref]] : []
            await publishEvent(constants.voteKind, voteType, [
                ...refTag,
                ["e", eventId],
                ["p", pubkey],
                ["k", `${kind}`]])
        }
    }

    useNDKSubscription(voteFilters as NDKFilter, {closeOnEose: false}, (event) => {
        const vote = voteTransformer(event)
        dispatch(updateVote(vote))
    })

    return (
        <div className="w-8 flex flex-col items-center">
            <ArrowUpCircleIcon
                className={voteActionClassName(myVote, VoteType.UPVOTE)}
                onClick={() => onVote(VoteType.UPVOTE)}
            />

            <p className="w-full text-center font-medium text-lg text-slate-500">{vote?.total ?? 0}</p>

            <ArrowDownCircleIcon
                className={voteActionClassName(myVote, VoteType.DOWNVOTE)}
                onClick={() => onVote(VoteType.DOWNVOTE)}
            />
        </div>
    )
}

export default Votes
