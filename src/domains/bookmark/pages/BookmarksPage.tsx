import { useMemo, useCallback } from "react";
import { useSelector, useDispatch } from "react-redux";
import type { NDKEvent, NDKFilter } from "@nostr-dev-kit/ndk";
import { RootState, AppDispatch } from "../../../app/store";
import useNDKSubscription, { ResourceType } from "../../../shared/hooks/useNDKSubscription";
import constants from "../../../constants";
import { questionTransformer } from "../../question/services/question.transformer";
import { addQuestion } from "../../question/store/question.slice";
import QuestionListItemB from "../../question/components/QuestionListItemB";
import SEOContainer from "../../../shared/components/SEOContainer";
import useBookmarks from "../hooks/useBookmarks";

const BookmarksPage = () => {
    const dispatch = useDispatch<AppDispatch>();
    const { bookmarkedQuestionIds, bookmarkCount, loading, initialized } = useBookmarks();
    const questionState = useSelector((state: RootState) => state.question);

    // Build filters for bookmarked questions
    const filters = useMemo<NDKFilter | null>(() => {
        if (bookmarkedQuestionIds.length === 0) return null;
        return {
            kinds: [constants.questionKind],
            "#d": bookmarkedQuestionIds
        };
    }, [bookmarkedQuestionIds]);

    const handleQuestionEvent = useCallback((event: NDKEvent) => {
        const question = questionTransformer(event);
        dispatch(addQuestion(question));
    }, [dispatch]);

    useNDKSubscription(
        filters ?? { kinds: [] },
        handleQuestionEvent,
        undefined,
        {
            ndkOptions: { closeOnEose: false },
            resourceType: ResourceType.QUESTION,
            enabled: !!filters
        }
    );

    // Get bookmarked questions from store
    const bookmarkedQuestions = useMemo(() => {
        return bookmarkedQuestionIds
            .map(id => questionState.data[id])
            .filter(Boolean)
            .sort((a, b) => (b.createdAt ?? 0) - (a.createdAt ?? 0));
    }, [bookmarkedQuestionIds, questionState.data]);

    const isLoading = loading || !initialized;

    return (
        <>
            <SEOContainer
                title="My Bookmarks"
                description="Your bookmarked questions on Apollo"
            />

            <div className="max-w-3xl overflow-hidden">
                <header className="mb-6">
                    <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-slate-100">
                        My Bookmarks
                    </h1>
                    <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                        {bookmarkCount} saved {bookmarkCount === 1 ? 'question' : 'questions'}
                    </p>
                </header>

                {isLoading ? (
                    <div className="space-y-4">
                        {[1, 2, 3].map(i => (
                            <div key={i} className="animate-pulse">
                                <div className="h-5 bg-slate-200 dark:bg-slate-700 rounded w-3/4 mb-2" />
                                <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-full mb-2" />
                                <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-1/2" />
                            </div>
                        ))}
                    </div>
                ) : bookmarkedQuestions.length > 0 ? (
                    <ul className="flex flex-col divide-y divide-slate-100 dark:divide-slate-800">
                        {bookmarkedQuestions.map((question) => (
                            <QuestionListItemB
                                key={question.eventId}
                                question={question}
                                showPreview={true}
                            />
                        ))}
                    </ul>
                ) : (
                    <div className="text-center py-8 md:py-12">
                        <div className="mx-auto h-24 w-24 text-slate-300 dark:text-slate-600 mb-4">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M17.593 3.322c1.1.128 1.907 1.077 1.907 2.185V21L12 17.25 4.5 21V5.507c0-1.108.806-2.057 1.907-2.185a48.507 48.507 0 0 1 11.186 0Z" />
                            </svg>
                        </div>
                        <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-2">
                            No bookmarks yet
                        </h3>
                        <p className="text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
                            Save questions to read later by clicking the bookmark icon.
                        </p>
                    </div>
                )}
            </div>
        </>
    );
};

export default BookmarksPage;
