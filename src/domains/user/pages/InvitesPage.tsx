import { useState, useMemo } from "react";
import { useSelector } from "react-redux";
import { Link } from "react-router";
import { HugeiconsIcon } from "@hugeicons/react";
import { CheckmarkCircle02Icon } from "@hugeicons-pro/core-solid-rounded";
import { Clock01Icon } from "@hugeicons-pro/core-twotone-rounded";
import { RootState } from "../../../app/store";
import useQuestionsForUser from "../hooks/useQuestionsForUser";
import useUserStats from "../hooks/useUserStats";
import { classNames, formatDateTime } from "../../../utils";
import EventOwner from "../components/EventOwner";
import SEOContainer from "../../../shared/components/SEOContainer";

type FilterId = 'all' | 'pending' | 'answered';

const InvitesPage = () => {
    const auth = useSelector((state: RootState) => state.auth);
    const [filter, setFilter] = useState<FilterId>('all');

    const { questions, loading, initialized } = useQuestionsForUser(auth.pubkey);
    const { answers } = useUserStats(auth.pubkey || '');

    // Calculate which questions the current user has answered
    const answeredIds = useMemo(() => {
        const userAnswers = answers.filter(a => a.user.pubkey === auth.pubkey);
        return new Set(userAnswers.map(a => a.questionId));
    }, [answers, auth.pubkey]);

    const hasAnswered = (questionId: string) => answeredIds.has(questionId);

    // Apply filter
    const filteredQuestions = useMemo(() => {
        if (filter === 'all') return questions;
        return questions.filter(q =>
            filter === 'answered' ? answeredIds.has(q.id) : !answeredIds.has(q.id)
        );
    }, [questions, filter, answeredIds]);

    // Counts for filter badges (single pass)
    const counts = useMemo(() => {
        let pending = 0, answered = 0;
        for (const q of questions) {
            if (answeredIds.has(q.id)) {
                answered++;
            } else {
                pending++;
            }
        }
        return { all: questions.length, pending, answered };
    }, [questions, answeredIds]);

    const filters: Array<{ id: FilterId; name: string; count: number }> = [
        { id: 'all', name: 'All', count: counts.all },
        { id: 'pending', name: 'Pending', count: counts.pending },
        { id: 'answered', name: 'Answered', count: counts.answered }
    ];

    const isLoading = loading || !initialized;

    return (
        <>
            <SEOContainer
                title="My Invites"
                description="Questions you've been invited to answer on Apollo"
            />

            <div className="max-w-3xl overflow-hidden">
                <header className="mb-6">
                    <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-slate-100">
                        Questions You've Been Invited To
                    </h1>
                    <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                        {counts.pending} pending {counts.pending === 1 ? 'question' : 'questions'} to answer
                    </p>
                </header>

                {/* Filter tabs */}
                <div className="border-b border-slate-200 dark:border-slate-700 mb-4">
                    <nav className="flex gap-4 md:gap-6">
                        {filters.map((f) => (
                            <button
                                key={f.id}
                                type="button"
                                onClick={() => setFilter(f.id)}
                                className={classNames(
                                    f.id === filter
                                        ? 'border-teal-500 text-slate-900 dark:text-slate-100'
                                        : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300 hover:border-slate-300 dark:hover:border-slate-600',
                                    'flex items-center gap-2 border-b-2 pb-3 text-sm font-medium whitespace-nowrap transition-colors'
                                )}
                            >
                                {f.name}
                                <span className={classNames(
                                    f.id === filter
                                        ? 'bg-slate-200 dark:bg-slate-700'
                                        : 'bg-slate-100 dark:bg-slate-800',
                                    'px-2 py-0.5 rounded-full text-xs tabular-nums'
                                )}>
                                    {f.count}
                                </span>
                            </button>
                        ))}
                    </nav>
                </div>

                {/* Content */}
                {isLoading ? (
                    <div className="divide-y divide-slate-200 dark:divide-slate-700">
                        {[...Array(3)].map((_, i) => (
                            <div key={i} className="py-4 animate-pulse">
                                <div className="flex items-center gap-2 mb-2">
                                    <div className="h-5 w-16 bg-slate-200 dark:bg-slate-700 rounded" />
                                </div>
                                <div className="h-5 w-3/4 bg-slate-200 dark:bg-slate-700 rounded mb-2" />
                                <div className="flex items-center gap-4 mt-2">
                                    <div className="h-4 w-24 bg-slate-200 dark:bg-slate-700 rounded" />
                                    <div className="h-4 w-32 bg-slate-200 dark:bg-slate-700 rounded" />
                                </div>
                            </div>
                        ))}
                    </div>
                ) : filteredQuestions.length === 0 ? (
                    <div className="text-center py-8 md:py-12">
                        <div className="mx-auto h-24 w-24 text-slate-300 dark:text-slate-600 mb-4">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M9.879 7.519c1.171-1.025 3.071-1.025 4.242 0 1.172 1.025 1.172 2.687 0 3.712-.203.179-.43.326-.67.442-.745.361-1.45.999-1.45 1.827v.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 5.25h.008v.008H12v-.008Z" />
                            </svg>
                        </div>
                        <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-2">
                            {filter === 'all' ? 'No invites yet' : filter === 'pending' ? 'All caught up!' : 'No answered questions'}
                        </h3>
                        <p className="text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
                            {filter === 'all'
                                ? "No one has invited you to answer a question yet."
                                : filter === 'pending'
                                    ? "You've answered all your invites. Great work!"
                                    : "You haven't answered any questions yet."}
                        </p>
                    </div>
                ) : (
                    <div className="divide-y divide-slate-200 dark:divide-slate-700">
                        {filteredQuestions.map(question => {
                            const answered = hasAnswered(question.id);
                            return (
                                <div key={question.id} className="py-4">
                                    <div className="flex items-start gap-3">
                                        {/* Status indicator */}
                                        <div className="shrink-0 mt-0.5">
                                            {answered ? (
                                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400">
                                                    <HugeiconsIcon icon={CheckmarkCircle02Icon} size={12} />
                                                    Answered
                                                </span>
                                            ) : (
                                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400">
                                                    <HugeiconsIcon icon={Clock01Icon} size={12} />
                                                    Pending
                                                </span>
                                            )}
                                        </div>

                                        <div className="w-0 min-w-0 flex-1 overflow-hidden">
                                            <Link
                                                to={`/questions/${question.id}`}
                                                className="block text-slate-900 dark:text-slate-100 hover:text-teal-600 dark:hover:text-teal-400 font-medium transition-colors line-clamp-2"
                                            >
                                                {question.title}
                                            </Link>

                                            <div className="flex items-center gap-4 mt-1.5 text-xs text-slate-500 dark:text-slate-400 min-w-0">
                                                <span className="flex items-center gap-1 min-w-0 truncate">Asked by <EventOwner pubkey={question.user.pubkey} mini={true} inline={true} /></span>
                                                <span className="flex-shrink-0">{formatDateTime(question.createdAt)}</span>
                                            </div>

                                            {question.tags.length > 0 && (
                                                <div className="flex flex-wrap gap-1.5 mt-2">
                                                    {question.tags.map(tag => (
                                                        <span
                                                            key={tag}
                                                            className="px-2 py-0.5 text-xs rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 max-w-[150px] truncate"
                                                        >
                                                            {tag}
                                                        </span>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </>
    );
};

export default InvitesPage;
