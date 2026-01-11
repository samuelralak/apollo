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

export interface ResourceVotes {
    upvotes: number;
    downvotes: number;
    score: number;
}

interface UseUserStatsResult {
    questions: Question[];
    answers: Answer[];
    questionVotes: Map<string, ResourceVotes>;
    answerVotes: Map<string, ResourceVotes>;
    stats: UserStats;
    loading: boolean;
}

// Stable empty stats object (prevents new object creation every render)
const EMPTY_STATS: UserStats = {
    reputation: 1,
    questionsCount: 0,
    answersCount: 0,
    votesReceived: { upvotes: 0, downvotes: 0, total: 0 },
    acceptedAnswers: 0
};

// Stable empty Maps (prevents new object creation every render)
const EMPTY_QUESTION_VOTES = new Map<string, ResourceVotes>();
const EMPTY_ANSWER_VOTES = new Map<string, ResourceVotes>();

/**
 * Extract the target pubkey from a vote event's p-tags.
 */
const extractVoteTargetPubkey = (event: NDKEvent, targetPubkey: string): string | undefined => {
    for (const tag of event.tags) {
        if (tag[0] === 'p' && tag[1] === targetPubkey) {
            return targetPubkey;
        }
    }
    return undefined;
};

/**
 * Hook for fetching user statistics with proper reputation calculation.
 *
 * Uses Maps for O(1) lookups and deduplication:
 * - Questions/Answers stored by ID for quick membership checks
 * - Votes keyed by voter:resource for handling vote changes (latest wins)
 */
const useUserStats = (pubkey: string): UseUserStatsResult => {
    // Track which pubkey the current state belongs to (prevents showing stale data)
    const [stateForPubkey, setStateForPubkey] = useState<string | undefined>(undefined);

    // Use Maps for O(1) lookups and automatic deduplication by key
    const [questionsMap, setQuestionsMap] = useState<Map<string, Question>>(new Map());
    const [answersMap, setAnswersMap] = useState<Map<string, Answer>>(new Map());
    // Key: `${voterPubkey}:${resourceId}` - stores latest vote per voter per resource
    const [votesMap, setVotesMap] = useState<Map<string, Vote>>(new Map());

    const [questionsLoading, setQuestionsLoading] = useState(true);
    const [answersLoading, setAnswersLoading] = useState(true);
    const [votesLoading, setVotesLoading] = useState(true);

    // Data is stale if it belongs to a different pubkey (prevents flash of old data)
    const isStale = stateForPubkey !== pubkey;

    // Reset state when pubkey changes (useUpdateEffect skips initial mount)
    useUpdateEffect(() => {
        setStateForPubkey(undefined);
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
    // IMPORTANT: Derive pubkey from event itself to prevent race condition where
    // useSyncedRef updates callback during render but old subscription events
    // arrive before cleanup effect runs.

    const handleQuestionEvent = useCallback((event: NDKEvent) => {
        const question = questionTransformer(event);
        // event.pubkey is the author (the user whose questions we're fetching)
        setStateForPubkey(event.pubkey);
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
        // event.pubkey is the author (the user whose answers we're fetching)
        setStateForPubkey(event.pubkey);
        setAnswersMap(prev => {
            if (prev.has(id)) return prev;
            const next = new Map(prev);
            next.set(id, answer);
            return next;
        });
    }, []);

    const handleVoteEvent = useCallback((event: NDKEvent) => {
        // Verify event belongs to current filter by checking p-tags
        const eventTargetPubkey = extractVoteTargetPubkey(event, pubkey);
        if (!eventTargetPubkey) return; // Event doesn't match current filter, ignore

        const vote = voteTransformer(event);
        // Key by voter:resource - if same voter votes again, keep latest
        const key = `${vote.pubkey}:${vote.resourceId}`;
        setStateForPubkey(eventTargetPubkey);
        setVotesMap(prev => {
            const existing = prev.get(key);
            // Keep the most recent vote (handles vote changes)
            if (existing && existing.createdAt >= vote.createdAt) return prev;
            const next = new Map(prev);
            next.set(key, vote);
            return next;
        });
    }, [pubkey]);

    // For EOSE, only set stateForPubkey if it hasn't been set by events yet
    const handleQuestionsEose = useCallback(() => {
        setStateForPubkey(prev => prev ?? pubkey);
        setQuestionsLoading(false);
    }, [pubkey]);
    const handleAnswersEose = useCallback(() => {
        setStateForPubkey(prev => prev ?? pubkey);
        setAnswersLoading(false);
    }, [pubkey]);
    const handleVotesEose = useCallback(() => {
        setStateForPubkey(prev => prev ?? pubkey);
        setVotesLoading(false);
    }, [pubkey]);

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

    // Calculate stats and per-resource votes with O(n) single-pass aggregation
    const { stats, questionVotes, answerVotes } = useMemo(() => {
        // Build Set of question IDs for O(1) lookup when categorizing votes
        const questionIds = new Set(questionsMap.keys());
        const answerIds = new Set(answersMap.keys());

        // Per-resource vote tracking
        const qVotes = new Map<string, ResourceVotes>();
        const aVotes = new Map<string, ResourceVotes>();

        // Initialize vote counts for all resources
        for (const id of questionIds) {
            qVotes.set(id, { upvotes: 0, downvotes: 0, score: 0 });
        }
        for (const id of answerIds) {
            aVotes.set(id, { upvotes: 0, downvotes: 0, score: 0 });
        }

        // Single pass through votes
        let totalUpvotes = 0;
        let totalDownvotes = 0;
        let reputation = 0;

        for (const vote of votesMap.values()) {
            const isQuestion = questionIds.has(vote.resourceId);
            const isAnswer = answerIds.has(vote.resourceId);
            const isUpvote = vote.vote === VoteType.UPVOTE;

            // Update per-resource votes
            if (isQuestion) {
                const current = qVotes.get(vote.resourceId)!;
                if (isUpvote) {
                    current.upvotes++;
                    current.score++;
                } else {
                    current.downvotes++;
                    current.score--;
                }
            } else if (isAnswer) {
                const current = aVotes.get(vote.resourceId)!;
                if (isUpvote) {
                    current.upvotes++;
                    current.score++;
                } else {
                    current.downvotes++;
                    current.score--;
                }
            }

            // Update totals
            if (isUpvote) {
                totalUpvotes++;
                reputation += isQuestion ? REPUTATION.QUESTION_UPVOTE : REPUTATION.ANSWER_UPVOTE;
            } else {
                totalDownvotes++;
                reputation += isQuestion ? REPUTATION.QUESTION_DOWNVOTE : REPUTATION.ANSWER_DOWNVOTE;
            }
        }

        const acceptedAnswers = 0;
        reputation += acceptedAnswers * REPUTATION.ANSWER_ACCEPTED;
        reputation = Math.max(1, reputation);

        return {
            stats: {
                reputation,
                questionsCount: questionsMap.size,
                answersCount: answersMap.size,
                votesReceived: {
                    upvotes: totalUpvotes,
                    downvotes: totalDownvotes,
                    total: totalUpvotes - totalDownvotes
                },
                acceptedAnswers
            } as UserStats,
            questionVotes: qVotes,
            answerVotes: aVotes
        };
    }, [questionsMap, answersMap, votesMap]);

    // If data is stale (from previous profile), return stable empty objects
    // This prevents flash of old data when navigating between profiles
    if (isStale) {
        return {
            questions: [],
            answers: [],
            questionVotes: EMPTY_QUESTION_VOTES,
            answerVotes: EMPTY_ANSWER_VOTES,
            stats: EMPTY_STATS,
            loading: true
        };
    }

    return {
        questions,
        answers,
        questionVotes,
        answerVotes,
        stats,
        loading: questionsLoading || answersLoading || votesLoading
    };
};

export default useUserStats;
