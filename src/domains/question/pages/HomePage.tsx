import { useState, useCallback, useMemo } from "react";
import { NDKEvent } from "@nostr-dev-kit/ndk";
import { questionTransformer } from "../services/question.transformer";
import Loader from "../../../shared/components/feedback/Loader";
import QuestionsList from "../components/QuestionsList";
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

    if (questions.lastFetched === 0) {
        return <Loader />;
    }

    if (Object.entries(questions.data).length === 0) {
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

            <QuestionsList questions={[...Object.values(questions.data)]} />
        </div>
    );
};

export default HomePage;
