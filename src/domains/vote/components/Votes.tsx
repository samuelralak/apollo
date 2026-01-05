import {ArrowDownCircleIcon, ArrowUpCircleIcon} from "@heroicons/react/24/outline";
import {useContext, useCallback, useMemo} from "react";
import {NDKContext} from "../../../lib/ndk/NDKProvider";
import type {NDKFilter, NDKKind, NDKEvent} from "@nostr-dev-kit/ndk";
import {useDispatch, useSelector} from "react-redux";
import {AppDispatch, RootState} from "../../../app/store";
import constants from "../../../constants";
import useNDKSubscription, {ResourceType} from "../../../shared/hooks/useNDKSubscription";
import type {Vote} from "../types/vote.types";
import {VoteType} from "../types/vote.types";
import {voteTransformer} from "../services/vote.transformer";
import {updateVote} from "../store/vote.slice";
import {classNames} from "../../../utils";

const voteActionClassName = (myVote: Vote, voteType: VoteType, horizontal?: boolean) =>
    classNames(
        myVote && myVote.vote === voteType
            ? 'text-green-500'
            : 'text-slate-400 dark:text-slate-500',
        horizontal ? 'h-5 w-5' : 'h-6 w-6 sm:h-8 sm:w-8',
        'cursor-pointer hover:text-slate-500 dark:hover:text-slate-400 transition-colors'
    );

const Votes = ({kind, eventId, pubkey, identifier, refEvent, horizontal}: {
    kind: NDKKind,
    eventId: string,
    pubkey: string,
    identifier: string,
    refEvent?: string,
    horizontal?: boolean
}) => {
    const aTag = `${kind}:${eventId}:${identifier}`
    const voteFilters = useMemo(() => ({
        kinds: [constants.voteKind],
        "#a": [aTag],
        "#p": [pubkey]
    }), [aTag, pubkey]);

    const {publishEvent} = useContext(NDKContext) as NDKContext
    const auth = useSelector((state: RootState) => state.auth);
    const vote = useSelector((state: RootState) => state.vote)[identifier];
    const dispatch = useDispatch() as AppDispatch
    const myVote = vote?.data[auth.pubkey ?? ""]

    const onVote = async (voteType: VoteType) => {
        if (auth.isLoggedIn) {
            const refTag = refEvent ? [["e", refEvent]] : []
            await publishEvent(constants.voteKind, voteType, [
                ["a", aTag],
                ...refTag,
                ["e", eventId],
                ["p", pubkey],
                ["k", `${kind}`]])
        }
    }

    const handleVoteEvent = useCallback((event: NDKEvent) => {
        const vote = voteTransformer(event)
        dispatch(updateVote(vote))
    }, [dispatch]);

    useNDKSubscription(
        voteFilters as NDKFilter,
        handleVoteEvent,
        undefined,
        {
            ndkOptions: { closeOnEose: false },
            resourceType: ResourceType.VOTE,
            context: { parentId: identifier }
        }
    );

    return (
        <div className={classNames(
            horizontal ? 'flex-row gap-1' : 'w-6 sm:w-8 flex-col',
            'flex items-center'
        )}>
            <button type="button" onClick={() => onVote(VoteType.UPVOTE)}>
                <ArrowUpCircleIcon
                    className={voteActionClassName(myVote, VoteType.UPVOTE, horizontal)}
                />
            </button>

            <p className={classNames(
                horizontal ? 'text-sm min-w-[1.5rem]' : 'w-full text-base sm:text-lg',
                'text-center font-medium text-slate-500 dark:text-slate-400'
            )}>{vote?.total ?? 0}</p>

            <button onClick={() => onVote(VoteType.DOWNVOTE)}>
                <ArrowDownCircleIcon
                    className={voteActionClassName(myVote, VoteType.DOWNVOTE, horizontal)}
                />
            </button>
        </div>
    )
}

export default Votes
