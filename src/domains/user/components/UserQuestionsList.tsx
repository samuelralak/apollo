import {useMemo} from "react";
import {Link} from "react-router";
import type {Question} from "../../question/types/question.types";
import type {ResourceVotes} from "../hooks/useUserStats";
import {formatDateTime} from "../../../utils";

interface UserQuestionsListProps {
    questions: Question[];
    votes: Map<string, ResourceVotes>;
    loading?: boolean;
}

const UserQuestionsListSkeleton = () => (
    <div>
        <div className="flex gap-6 mb-4 animate-pulse">
            <div className="h-4 w-24 bg-slate-200 dark:bg-slate-700 rounded" />
            <div className="h-4 w-28 bg-slate-200 dark:bg-slate-700 rounded" />
            <div className="h-4 w-20 bg-slate-200 dark:bg-slate-700 rounded" />
        </div>
        <div className="divide-y divide-slate-200 dark:divide-slate-700">
            {[...Array(3)].map((_, i) => (
                <div key={i} className="py-4 animate-pulse">
                    <div className="h-5 w-3/4 bg-slate-200 dark:bg-slate-700 rounded mb-2" />
                    <div className="flex items-center gap-4 mt-2">
                        <div className="h-4 w-24 bg-slate-200 dark:bg-slate-700 rounded" />
                    </div>
                    <div className="flex gap-2 mt-2">
                        <div className="h-5 w-14 bg-slate-200 dark:bg-slate-700 rounded" />
                        <div className="h-5 w-16 bg-slate-200 dark:bg-slate-700 rounded" />
                    </div>
                </div>
            ))}
        </div>
    </div>
);

interface TopQuestion {
    question: Question;
    score: number;
}

const UserQuestionsList = ({questions, votes, loading}: UserQuestionsListProps) => {
    const { topVoted, mostControversial, totalVotes } = useMemo((): {
        topVoted: TopQuestion | null;
        mostControversial: TopQuestion | null;
        totalVotes: { up: number; down: number };
    } => {
        let top: TopQuestion | null = null;
        let controversial: TopQuestion | null = null;
        let totalUp = 0;
        let totalDown = 0;

        questions.forEach(q => {
            const v = votes.get(q.id);
            if (!v) return;

            totalUp += v.upvotes;
            totalDown += v.downvotes;

            // Top voted = highest score
            if (!top || v.score > top.score) {
                top = { question: q, score: v.score };
            }

            // Most controversial = most downvotes (with at least 1 downvote)
            if (v.downvotes > 0 && (!controversial || v.downvotes > (votes.get(controversial.question.id)?.downvotes ?? 0))) {
                controversial = { question: q, score: v.score };
            }
        });

        return {
            topVoted: top,
            mostControversial: controversial,
            totalVotes: { up: totalUp, down: totalDown }
        };
    }, [questions, votes]);

    if (loading) {
        return <UserQuestionsListSkeleton />;
    }

    if (questions.length === 0) {
        return (
            <div className="text-center py-8 text-slate-500 dark:text-slate-400">
                No questions yet
            </div>
        );
    }

    // Sort by score descending, then by date
    const sortedQuestions = [...questions].sort((a, b) => {
        const scoreA = votes.get(a.id)?.score ?? 0;
        const scoreB = votes.get(b.id)?.score ?? 0;
        if (scoreB !== scoreA) return scoreB - scoreA;
        return (b.createdAt ?? 0) - (a.createdAt ?? 0);
    });

    return (
        <div>
            {/* Stats Summary */}
            <div className="flex flex-wrap gap-x-6 gap-y-2 mb-4 text-sm">
                <span className="text-slate-600 dark:text-slate-400">
                    <span className="font-semibold text-slate-900 dark:text-slate-100">{questions.length}</span> questions
                </span>
                <span className="text-slate-600 dark:text-slate-400">
                    <span className="font-semibold text-green-600 dark:text-green-400">+{totalVotes.up}</span>
                    {' / '}
                    <span className="font-semibold text-red-600 dark:text-red-400">-{totalVotes.down}</span> votes
                </span>
            </div>

            {/* Highlights */}
            {(topVoted || mostControversial) && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
                    {topVoted && topVoted.score > 0 && (
                        <Link
                            to={`/questions/${topVoted.question.id}`}
                            className="p-3 rounded-lg bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 hover:bg-green-100 dark:hover:bg-green-900/30 transition-colors"
                        >
                            <p className="text-xs font-medium text-green-700 dark:text-green-400 mb-1">Most Voted</p>
                            <p className="text-sm text-slate-900 dark:text-slate-100 line-clamp-1">{topVoted.question.title}</p>
                            <p className="text-xs text-green-600 dark:text-green-500 mt-1">+{topVoted.score} score</p>
                        </Link>
                    )}
                    {mostControversial && (votes.get(mostControversial.question.id)?.downvotes ?? 0) > 0 && (
                        <Link
                            to={`/questions/${mostControversial.question.id}`}
                            className="p-3 rounded-lg bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 hover:bg-amber-100 dark:hover:bg-amber-900/30 transition-colors"
                        >
                            <p className="text-xs font-medium text-amber-700 dark:text-amber-400 mb-1">Most Discussed</p>
                            <p className="text-sm text-slate-900 dark:text-slate-100 line-clamp-1">{mostControversial.question.title}</p>
                            <p className="text-xs text-amber-600 dark:text-amber-500 mt-1">{votes.get(mostControversial.question.id)?.downvotes} downvotes</p>
                        </Link>
                    )}
                </div>
            )}

            {/* Questions List */}
            <div className="divide-y divide-slate-200 dark:divide-slate-700">
                {sortedQuestions.map(question => {
                    const v = votes.get(question.id);
                    return (
                        <div key={question.id} className="py-4">
                            <div className="flex items-start gap-3">
                                {/* Vote score */}
                                <div className="shrink-0 w-12 text-center">
                                    <span className={`text-sm font-semibold ${
                                        (v?.score ?? 0) > 0
                                            ? 'text-green-600 dark:text-green-400'
                                            : (v?.score ?? 0) < 0
                                                ? 'text-red-600 dark:text-red-400'
                                                : 'text-slate-400 dark:text-slate-500'
                                    }`}>
                                        {(v?.score ?? 0) > 0 ? '+' : ''}{v?.score ?? 0}
                                    </span>
                                    <p className="text-xs text-slate-400 dark:text-slate-500">votes</p>
                                </div>

                                <div className="min-w-0 flex-1">
                                    <Link
                                        to={`/questions/${question.id}`}
                                        className="text-slate-900 dark:text-slate-100 hover:text-teal-600 dark:hover:text-teal-400 font-medium transition-colors"
                                    >
                                        {question.title}
                                    </Link>

                                    <div className="flex items-center gap-4 mt-1.5 text-xs text-slate-500 dark:text-slate-400">
                                        <span>{formatDateTime(question.createdAt)}</span>
                                        {question.acceptedAnswerId && (
                                            <span className="text-green-600 dark:text-green-400">Resolved</span>
                                        )}
                                    </div>

                                    {question.tags.length > 0 && (
                                        <div className="flex flex-wrap gap-1.5 mt-2">
                                            {question.tags.map(tag => (
                                                <span
                                                    key={tag}
                                                    className="px-2 py-0.5 text-xs rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400"
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
        </div>
    );
};

export default UserQuestionsList;
