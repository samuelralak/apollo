import { useState, useCallback, useMemo } from "react";
import { NDKEvent } from "@nostr-dev-kit/ndk";
import { questionTransformer } from "../services/question.transformer";
import QuestionsList from "../components/QuestionsList";
import QuestionsListSkeleton from "../components/QuestionsListSkeleton";
import NewQuestionsBanner from "../components/NewQuestionsBanner";
import constants from "../../../constants";
import useNDKSubscription, { EventHandlingMode, ResourceType } from "../../../shared/hooks/useNDKSubscription";
import { usePendingQuestions } from "../../../shared/hooks/usePendingEvents";
import { addQuestion, updateLastFetched } from "../store/question.slice";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "../../../app/store";
import EmptyState from "../components/EmptyState";

const HomePage = () => {
    const dispatch = useDispatch<AppDispatch>();
    const questions = useSelector((state: RootState) => state.question);
    const [initialLoadComplete, setInitialLoadComplete] = useState(false);

    // Hook for pending questions (new events banner)
    const { count: pendingCount, loadPending } = usePendingQuestions();

    // Stable callback for handling question events
    const handleQuestionEvent = useCallback((event: NDKEvent) => {
        const questionFromEvent = questionTransformer(event);
        dispatch(addQuestion(questionFromEvent));
    }, [dispatch]);

    // Handle EOSE - switch to buffered mode
    const handleEose = useCallback(() => {
        dispatch(updateLastFetched());
        setInitialLoadComplete(true);
    }, [dispatch]);

    // Filter configuration - memoized to prevent unnecessary re-renders
    const filters = useMemo(() => ({
        kinds: [constants.questionKind]
    }), []);

    // Memoize questions array to prevent re-renders
    const sortedQuestions = useMemo(() =>
        Object.values(questions.data).sort((a, b) => (b.createdAt ?? 0) - (a.createdAt ?? 0)),
        [questions.data]
    );

    // Subscribe with IMMEDIATE mode during initial load, BUFFERED after
    useNDKSubscription(
        filters,
        handleQuestionEvent,
        handleEose,
        {
            ndkOptions: { closeOnEose: false },
            mode: initialLoadComplete ? EventHandlingMode.BUFFERED : EventHandlingMode.IMMEDIATE,
            resourceType: ResourceType.QUESTION
        }
    );

    const isLoading = questions.lastFetched === 0;

    // Show empty state only after initial load completes
    if (!isLoading && sortedQuestions.length === 0) {
        return <EmptyState />;
    }

    return (
        <div className="max-w-3xl">
            {/* New questions available banner */}
            <NewQuestionsBanner
                count={pendingCount}
                onLoad={loadPending}
                onLoadCallback={handleQuestionEvent}
            />

            {isLoading ? (
                <QuestionsListSkeleton count={6} />
            ) : (
                <QuestionsList questions={sortedQuestions} />
            )}
        </div>
    );
};

export default HomePage;
