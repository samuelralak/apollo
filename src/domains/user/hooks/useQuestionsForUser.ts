import { useCallback, useMemo, useState } from "react";
import { useUpdateEffect } from "@react-hookz/web";
import type { NDKEvent, NDKFilter } from "@nostr-dev-kit/ndk";
import useNDKSubscription, { EventHandlingMode, ResourceType } from "../../../shared/hooks/useNDKSubscription";
import constants from "../../../constants";
import { questionTransformer } from "../../question/services/question.transformer";
import type { Question } from "../../question/types/question.types";

interface UseQuestionsForUserReturn {
    /** Questions where this user is invited (p-tagged) */
    questions: Question[];
    /** Number of invited questions */
    count: number;
    /** Loading state */
    loading: boolean;
    /** Whether initial load is complete */
    initialized: boolean;
}

// Stable empty return for stale state (prevents new object creation every render)
const EMPTY_RETURN: UseQuestionsForUserReturn = {
    questions: [],
    count: 0,
    loading: true,
    initialized: false
};

/**
 * Verify the event p-tags contain the target pubkey.
 * Prevents race condition where late events from old subscription
 * arrive after callback is updated but before cleanup.
 */
const eventTargetsUser = (event: NDKEvent, targetPubkey: string | undefined): boolean => {
    if (!targetPubkey) return false;
    return event.tags.some(tag => tag[0] === 'p' && tag[1] === targetPubkey);
};

/**
 * Hook to fetch questions where a specific user is invited (p-tagged).
 *
 * Used for:
 * - Profile "Invites" tab (public view - AMA discovery)
 * - /invites page (private view - user's inbox)
 *
 * @param pubkey - The user's pubkey to fetch invited questions for
 */
const useQuestionsForUser = (pubkey: string | undefined): UseQuestionsForUserReturn => {
    // Track which pubkey the current state belongs to (prevents showing stale data)
    const [stateForPubkey, setStateForPubkey] = useState<string | undefined>(undefined);
    // Use Map for O(1) lookups and automatic deduplication
    const [questionsMap, setQuestionsMap] = useState<Map<string, Question>>(new Map());
    const [initialized, setInitialized] = useState(false);
    const [loading, setLoading] = useState(true);

    // Data is stale if it belongs to a different pubkey (prevents flash of old data)
    const isStale = stateForPubkey !== pubkey;

    // Reset state when pubkey changes (useUpdateEffect skips initial mount)
    useUpdateEffect(() => {
        setStateForPubkey(undefined);
        setQuestionsMap(new Map());
        setInitialized(false);
        setLoading(true);
    }, [pubkey]);

    // Build filter: questions that contain this pubkey in a p tag
    const filters = useMemo<NDKFilter | null>(() => {
        if (!pubkey) return null;
        return {
            kinds: [constants.questionKind as number],
            "#p": [pubkey],
            limit: 100
        };
    }, [pubkey]);

    // Handle incoming question events
    // IMPORTANT: Verify event belongs to current filter and exclude self-authored
    const handleQuestionEvent = useCallback((event: NDKEvent) => {
        // Verify p-tag contains target (handles race condition)
        if (!eventTargetsUser(event, pubkey)) return;

        // Exclude self-authored questions (can't meaningfully invite yourself)
        if (event.pubkey === pubkey) return;

        const question = questionTransformer(event);
        setStateForPubkey(pubkey);
        setQuestionsMap(prev => {
            if (prev.has(question.id)) return prev;
            const next = new Map(prev);
            next.set(question.id, question);
            return next;
        });
    }, [pubkey]);

    // For EOSE, only set stateForPubkey if it hasn't been set by events yet (no invites case)
    const handleEose = useCallback(() => {
        setStateForPubkey(prev => prev ?? pubkey);
        setInitialized(true);
        setLoading(false);
    }, [pubkey]);

    // Subscribe to questions containing the target pubkey in p-tags
    useNDKSubscription(
        filters ?? { kinds: [] },
        handleQuestionEvent,
        handleEose,
        {
            ndkOptions: { closeOnEose: false },
            mode: EventHandlingMode.IMMEDIATE,
            resourceType: ResourceType.QUESTION,
            context: { parentId: `questions-for-${pubkey}` },
            enabled: !!filters
        }
    );

    // Convert Map values to sorted array (newest first)
    const questions = useMemo(
        () => Array.from(questionsMap.values())
            .sort((a, b) => (b.createdAt ?? 0) - (a.createdAt ?? 0)),
        [questionsMap]
    );

    // If data is stale (from previous profile), return stable empty object
    // This prevents flash of old data when navigating between profiles
    if (isStale) {
        return EMPTY_RETURN;
    }

    return {
        questions,
        count: questions.length,
        loading,
        initialized
    };
};

export default useQuestionsForUser;
