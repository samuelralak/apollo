import { useCallback, useMemo } from 'react';
import type { NDKEvent, NDKFilter } from '@nostr-dev-kit/ndk';
import { useDispatch } from 'react-redux';
import type { AppDispatch } from '../../../app/store';
import constants from '../../../constants';
import useNDKSubscription, { ResourceType } from '../../../shared/hooks/useNDKSubscription';
import { voteTransformer } from '../../vote/services/vote.transformer';
import { answerTransformer } from '../../answer/services/answer.transformer';
import { updateVote } from '../../vote/store/vote.slice';
import { updateAnswer } from '../../answer/store/answer.slice';
import type { Question } from '../types/question.types';

/** Subscribes to vote and answer stats for a question, populating Redux store */
const useQuestionStats = (question: Question) => {
    const dispatch = useDispatch<AppDispatch>();
    const { id, user: { pubkey } } = question;
    const aTag = `${constants.questionKind}:${pubkey}:${id}`;

    const voteFilters = useMemo<NDKFilter>(() => ({
        kinds: [constants.voteKind],
        "#a": [aTag],
        "#p": [pubkey]
    }), [aTag, pubkey]);

    const answerFilters = useMemo<NDKFilter>(() => ({
        kinds: [constants.answerKind],
        "#a": [aTag]
    }), [aTag]);

    const handleVoteEvent = useCallback((event: NDKEvent) => {
        dispatch(updateVote(voteTransformer(event)));
    }, [dispatch]);

    const handleAnswerEvent = useCallback((event: NDKEvent) => {
        dispatch(updateAnswer(answerTransformer(event)));
    }, [dispatch]);

    const subscriptionOpts = { ndkOptions: { closeOnEose: true }, context: { parentId: id } };

    useNDKSubscription(voteFilters, handleVoteEvent, undefined, {
        ...subscriptionOpts,
        resourceType: ResourceType.VOTE
    });

    useNDKSubscription(answerFilters, handleAnswerEvent, undefined, {
        ...subscriptionOpts,
        resourceType: ResourceType.ANSWER
    });
};

export default useQuestionStats;
