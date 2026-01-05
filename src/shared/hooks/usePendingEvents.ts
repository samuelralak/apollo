import { useCallback, useMemo } from "react";
import { useSelector, useDispatch } from "react-redux";
import type { RootState, AppDispatch } from "../../app/store";
import { clearPendingEvents } from "../store/subscription.slice";
import {
    SubscriptionManager,
    ResourceType,
    type SubscriptionContext
} from "../../lib/subscriptions";
import type { NDKEvent } from "@nostr-dev-kit/ndk";

interface UsePendingEventsResult {
    /** Number of pending events */
    count: number;
    /** Whether there are pending events */
    hasPending: boolean;
    /** List of pending event IDs */
    pendingIds: string[];
    /** Load pending events (calls callback for each, then clears) */
    loadPending: (callback: (event: NDKEvent) => void) => void;
    /** Dismiss pending events without loading */
    dismissPending: () => void;
}

interface UsePendingQuestionsResult extends UsePendingEventsResult {
    /** Oldest pending question timestamp (for time display) */
    oldestTimestamp: number | null;
}

/**
 * Hook for accessing pending questions.
 * Use this for the "X new questions available" banner on HomePage.
 */
export function usePendingQuestions(): UsePendingQuestionsResult {
    const dispatch = useDispatch<AppDispatch>();
    const pending = useSelector((state: RootState) => state.subscription.pending.questions);

    const loadPending = useCallback((callback: (event: NDKEvent) => void) => {
        const manager = SubscriptionManager.getInstance();
        manager.flushBufferedEvents(ResourceType.QUESTION, undefined, callback);
        dispatch(clearPendingEvents({ resourceType: ResourceType.QUESTION }));
    }, [dispatch]);

    const dismissPending = useCallback(() => {
        const manager = SubscriptionManager.getInstance();
        // Flush without callback to just clear the buffer
        manager.flushBufferedEvents(ResourceType.QUESTION);
        dispatch(clearPendingEvents({ resourceType: ResourceType.QUESTION }));
    }, [dispatch]);

    return {
        count: pending.count,
        hasPending: pending.count > 0,
        pendingIds: pending.ids,
        oldestTimestamp: pending.oldestTimestamp,
        loadPending,
        dismissPending
    };
}

/**
 * Hook for accessing pending answers for a specific question.
 */
export function usePendingAnswers(questionId: string): UsePendingEventsResult {
    const dispatch = useDispatch<AppDispatch>();
    const pending = useSelector(
        (state: RootState) => state.subscription.pending.answers[questionId]
    );

    const context: SubscriptionContext = useMemo(() => ({ parentId: questionId }), [questionId]);

    const loadPending = useCallback((callback: (event: NDKEvent) => void) => {
        const manager = SubscriptionManager.getInstance();
        manager.flushBufferedEvents(ResourceType.ANSWER, context, callback);
        dispatch(clearPendingEvents({ resourceType: ResourceType.ANSWER, context }));
    }, [dispatch, context]);

    const dismissPending = useCallback(() => {
        const manager = SubscriptionManager.getInstance();
        manager.flushBufferedEvents(ResourceType.ANSWER, context);
        dispatch(clearPendingEvents({ resourceType: ResourceType.ANSWER, context }));
    }, [dispatch, context]);

    return {
        count: pending?.count ?? 0,
        hasPending: (pending?.count ?? 0) > 0,
        pendingIds: pending?.ids ?? [],
        loadPending,
        dismissPending
    };
}

/**
 * Hook for accessing pending comments for a specific resource.
 */
export function usePendingComments(parentId: string): UsePendingEventsResult {
    const dispatch = useDispatch<AppDispatch>();
    const pending = useSelector(
        (state: RootState) => state.subscription.pending.comments[parentId]
    );

    const context: SubscriptionContext = useMemo(() => ({ parentId }), [parentId]);

    const loadPending = useCallback((callback: (event: NDKEvent) => void) => {
        const manager = SubscriptionManager.getInstance();
        manager.flushBufferedEvents(ResourceType.COMMENT, context, callback);
        dispatch(clearPendingEvents({ resourceType: ResourceType.COMMENT, context }));
    }, [dispatch, context]);

    const dismissPending = useCallback(() => {
        const manager = SubscriptionManager.getInstance();
        manager.flushBufferedEvents(ResourceType.COMMENT, context);
        dispatch(clearPendingEvents({ resourceType: ResourceType.COMMENT, context }));
    }, [dispatch, context]);

    return {
        count: pending?.count ?? 0,
        hasPending: (pending?.count ?? 0) > 0,
        pendingIds: pending?.ids ?? [],
        loadPending,
        dismissPending
    };
}

/**
 * Hook for accessing pending votes for a specific resource.
 */
export function usePendingVotes(resourceId: string): UsePendingEventsResult {
    const dispatch = useDispatch<AppDispatch>();
    const pending = useSelector(
        (state: RootState) => state.subscription.pending.votes[resourceId]
    );

    const context: SubscriptionContext = useMemo(() => ({ parentId: resourceId }), [resourceId]);

    const loadPending = useCallback((callback: (event: NDKEvent) => void) => {
        const manager = SubscriptionManager.getInstance();
        manager.flushBufferedEvents(ResourceType.VOTE, context, callback);
        dispatch(clearPendingEvents({ resourceType: ResourceType.VOTE, context }));
    }, [dispatch, context]);

    const dismissPending = useCallback(() => {
        const manager = SubscriptionManager.getInstance();
        manager.flushBufferedEvents(ResourceType.VOTE, context);
        dispatch(clearPendingEvents({ resourceType: ResourceType.VOTE, context }));
    }, [dispatch, context]);

    return {
        count: pending?.count ?? 0,
        hasPending: (pending?.count ?? 0) > 0,
        pendingIds: pending?.ids ?? [],
        loadPending,
        dismissPending
    };
}
