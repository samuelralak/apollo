import {useState, useCallback, useMemo} from "react";
import {useUpdateEffect} from "@react-hookz/web";
import type {NDKEvent, NDKFilter} from "@nostr-dev-kit/ndk";
import useNDKSubscription, {ResourceType} from "../../../shared/hooks/useNDKSubscription";
import {questionTransformer} from "../../question/services/question.transformer";
import {answerTransformer} from "../../answer/services/answer.transformer";
import {voteTransformer} from "../../vote/services/vote.transformer";
import {VoteType} from "../../vote/types/vote.types";
import constants from "../../../constants";
import type {UserStats} from "../types/profile.types";
import type {Question} from "../../question/types/question.types";
import type {Answer} from "../../answer/types/answer.types";
import type {Vote} from "../../vote/types/vote.types";

/**
 * Reputation scoring constants (Stack Overflow inspired)
 */
const REPUTATION = {
    QUESTION_UPVOTE: 5,
    QUESTION_DOWNVOTE: -2,
    ANSWER_UPVOTE: 10,
    ANSWER_DOWNVOTE: -2,
    ANSWER_ACCEPTED: 15
} as const;

interface UseUserStatsResult {
    questions: Question[];
    answers: Answer[];
    stats: UserStats;
    loading: boolean;
}

/**
 * Hook for fetching user statistics with proper reputation calculation.
 *
 * Uses Maps for O(1) lookups and deduplication:
 * - Questions/Answers stored by ID for quick membership checks
 * - Votes keyed by voter:resource for handling vote changes (latest wins)
 */
const useUserStats = (pubkey: string): UseUserStatsResult => {
    // Use Maps for O(1) lookups and automatic deduplication by key
    const [questionsMap, setQuestionsMap] = useState<Map<string, Question>>(new Map());
    const [answersMap, setAnswersMap] = useState<Map<string, Answer>>(new Map());
    // Key: `${voterPubkey}:${resourceId}` - stores latest vote per voter per resource
    const [votesMap, setVotesMap] = useState<Map<string, Vote>>(new Map());

    const [questionsLoading, setQuestionsLoading] = useState(true);
    const [answersLoading, setAnswersLoading] = useState(true);
    const [votesLoading, setVotesLoading] = useState(true);

    // Reset state when pubkey changes (useUpdateEffect skips initial mount)
    useUpdateEffect(() => {
        setQuestionsMap(new Map());
        setAnswersMap(new Map());
        setVotesMap(new Map());
        setQuestionsLoading(true);
        setAnswersLoading(true);
        setVotesLoading(true);
    }, [pubkey]);

    // Memoize filters
    const questionFilters = useMemo<NDKFilter>(() => ({
        kinds: [constants.questionKind],
        authors: [pubkey]
    }), [pubkey]);

    const answerFilters = useMemo<NDKFilter>(() => ({
        kinds: [constants.answerKind],
        authors: [pubkey]
    }), [pubkey]);

    // Votes received on user's content (tagged with #p)
    const voteFilters = useMemo<NDKFilter>(() => ({
        kinds: [constants.voteKind],
        "#p": [pubkey]
    }), [pubkey]);

    // Event handlers with Map updates for O(1) deduplication
    const handleQuestionEvent = useCallback((event: NDKEvent) => {
        const question = questionTransformer(event);
        setQuestionsMap(prev => {
            if (prev.has(question.id)) return prev;
            const next = new Map(prev);
            next.set(question.id, question);
            return next;
        });
    }, []);

    const handleAnswerEvent = useCallback((event: NDKEvent) => {
        const answer = answerTransformer(event);
        const id = answer.id || answer.eventId;
        setAnswersMap(prev => {
            if (prev.has(id)) return prev;
            const next = new Map(prev);
            next.set(id, answer);
            return next;
        });
    }, []);

    const handleVoteEvent = useCallback((event: NDKEvent) => {
        const vote = voteTransformer(event);
        // Key by voter:resource - if same voter votes again, keep latest
        const key = `${vote.pubkey}:${vote.resourceId}`;
        setVotesMap(prev => {
            const existing = prev.get(key);
            // Keep the most recent vote (handles vote changes)
            if (existing && existing.createdAt >= vote.createdAt) return prev;
            const next = new Map(prev);
            next.set(key, vote);
            return next;
        });
    }, []);

    const handleQuestionsEose = useCallback(() => setQuestionsLoading(false), []);
    const handleAnswersEose = useCallback(() => setAnswersLoading(false), []);
    const handleVotesEose = useCallback(() => setVotesLoading(false), []);

    // Subscriptions
    useNDKSubscription(questionFilters, handleQuestionEvent, handleQuestionsEose, {
        resourceType: ResourceType.QUESTION,
        context: {parentId: `user-questions-${pubkey}`}
    });

    useNDKSubscription(answerFilters, handleAnswerEvent, handleAnswersEose, {
        resourceType: ResourceType.ANSWER,
        context: {parentId: `user-answers-${pubkey}`}
    });

    useNDKSubscription(voteFilters, handleVoteEvent, handleVotesEose, {
        resourceType: ResourceType.VOTE,
        context: {parentId: `user-votes-${pubkey}`}
    });

    // Convert Maps to arrays for consumers
    const questions = useMemo(() => Array.from(questionsMap.values()), [questionsMap]);
    const answers = useMemo(() => Array.from(answersMap.values()), [answersMap]);

    // Calculate stats with O(n) single-pass aggregation
    const stats = useMemo<UserStats>(() => {
        // Build Set of question IDs for O(1) lookup when categorizing votes
        const questionIds = new Set(questionsMap.keys());

        // Single pass through votes to calculate reputation
        let upvotes = 0;
        let downvotes = 0;
        let reputation = 0;

        for (const vote of votesMap.values()) {
            const isQuestion = questionIds.has(vote.resourceId);
            const isUpvote = vote.vote === VoteType.UPVOTE;

            if (isUpvote) {
                upvotes++;
                reputation += isQuestion ? REPUTATION.QUESTION_UPVOTE : REPUTATION.ANSWER_UPVOTE;
            } else {
                downvotes++;
                reputation += isQuestion ? REPUTATION.QUESTION_DOWNVOTE : REPUTATION.ANSWER_DOWNVOTE;
            }
        }

        // Accepted answers calculation would require fetching questions the user answered
        // to check if acceptedAnswerId matches. For now, this is a placeholder.
        // TODO: Add subscription to questions containing user's answers for full accuracy
        const acceptedAnswers = 0;

        reputation += acceptedAnswers * REPUTATION.ANSWER_ACCEPTED;

        // Ensure reputation doesn't go below 1 (Stack Overflow minimum)
        reputation = Math.max(1, reputation);

        return {
            reputation,
            questionsCount: questionsMap.size,
            answersCount: answersMap.size,
            votesReceived: {
                upvotes,
                downvotes,
                total: upvotes - downvotes
            },
            acceptedAnswers
        };
    }, [questionsMap, answersMap, votesMap]);

    return {
        questions,
        answers,
        stats,
        loading: questionsLoading || answersLoading || votesLoading
    };
};

export default useUserStats;
