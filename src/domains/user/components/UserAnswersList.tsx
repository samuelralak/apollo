import {useMemo} from "react";
import {Link} from "react-router";
import type {Answer} from "../../answer/types/answer.types";
import type {ResourceVotes} from "../hooks/useUserStats";
import {formatDateTime} from "../../../utils";

interface UserAnswersListProps {
    answers: Answer[];
    votes: Map<string, ResourceVotes>;
    loading?: boolean;
}

const UserAnswersListSkeleton = () => (
    <div>
        <div className="flex gap-6 mb-4 animate-pulse">
            <div className="h-4 w-24 bg-slate-200 dark:bg-slate-700 rounded" />
            <div className="h-4 w-32 bg-slate-200 dark:bg-slate-700 rounded" />
        </div>
        <div className="divide-y divide-slate-200 dark:divide-slate-700">
            {[...Array(3)].map((_, i) => (
                <div key={i} className="py-4 animate-pulse">
                    <div className="h-4 w-full bg-slate-200 dark:bg-slate-700 rounded mb-1" />
                    <div className="h-4 w-2/3 bg-slate-200 dark:bg-slate-700 rounded mb-2" />
                    <div className="flex items-center gap-4 mt-2">
                        <div className="h-4 w-24 bg-slate-200 dark:bg-slate-700 rounded" />
                    </div>
                </div>
            ))}
        </div>
    </div>
);

interface TopAnswer {
    answer: Answer;
    score: number;
}

const UserAnswersList = ({answers, votes, loading}: UserAnswersListProps) => {
    const { topVoted, mostControversial, totalVotes, uniqueQuestions } = useMemo((): {
        topVoted: TopAnswer | null;
        mostControversial: TopAnswer | null;
        totalVotes: { up: number; down: number };
        uniqueQuestions: number;
    } => {
        let top: TopAnswer | null = null;
        let controversial: TopAnswer | null = null;
        let totalUp = 0;
        let totalDown = 0;
        const questionIds = new Set<string>();

        answers.forEach(a => {
            const id = a.id || a.eventId;
            const v = votes.get(id);
            questionIds.add(a.questionId);
            if (!v) return;

            totalUp += v.upvotes;
            totalDown += v.downvotes;

            // Top voted = highest score
            if (!top || v.score > top.score) {
                top = { answer: a, score: v.score };
            }

            // Most controversial = most downvotes (with at least 1 downvote)
            const topId = controversial?.answer.id || controversial?.answer.eventId;
            if (v.downvotes > 0 && (!controversial || v.downvotes > (votes.get(topId!)?.downvotes ?? 0))) {
                controversial = { answer: a, score: v.score };
            }
        });

        return {
            topVoted: top,
            mostControversial: controversial,
            totalVotes: { up: totalUp, down: totalDown },
            uniqueQuestions: questionIds.size
        };
    }, [answers, votes]);

    if (loading) {
        return <UserAnswersListSkeleton />;
    }

    if (answers.length === 0) {
        return (
            <div className="text-center py-8 text-slate-500 dark:text-slate-400">
                No answers yet
            </div>
        );
    }

    // Sort by score descending, then by date
    const sortedAnswers = [...answers].sort((a, b) => {
        const idA = a.id || a.eventId;
        const idB = b.id || b.eventId;
        const scoreA = votes.get(idA)?.score ?? 0;
        const scoreB = votes.get(idB)?.score ?? 0;
        if (scoreB !== scoreA) return scoreB - scoreA;
        return b.createdAt - a.createdAt;
    });

    return (
        <div>
            {/* Stats Summary */}
            <div className="flex flex-wrap gap-x-6 gap-y-2 mb-4 text-sm">
                <span className="text-slate-600 dark:text-slate-400">
                    <span className="font-semibold text-slate-900 dark:text-slate-100">{answers.length}</span> answers
                </span>
                <span className="text-slate-600 dark:text-slate-400">
                    <span className="font-semibold text-slate-900 dark:text-slate-100">{uniqueQuestions}</span> questions answered
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
                            to={`/questions/${topVoted.answer.questionId}`}
                            className="p-3 rounded-lg bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 hover:bg-green-100 dark:hover:bg-green-900/30 transition-colors"
                        >
                            <p className="text-xs font-medium text-green-700 dark:text-green-400 mb-1">Most Helpful</p>
                            <p className="text-sm text-slate-900 dark:text-slate-100 line-clamp-1">
                                {topVoted.answer.description.slice(0, 80)}...
                            </p>
                            <p className="text-xs text-green-600 dark:text-green-500 mt-1">+{topVoted.score} score</p>
                        </Link>
                    )}
                    {mostControversial && (() => {
                        const contId = mostControversial.answer.id || mostControversial.answer.eventId;
                        const downvotes = votes.get(contId)?.downvotes ?? 0;
                        return downvotes > 0 && (
                            <Link
                                to={`/questions/${mostControversial.answer.questionId}`}
                                className="p-3 rounded-lg bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 hover:bg-amber-100 dark:hover:bg-amber-900/30 transition-colors"
                            >
                                <p className="text-xs font-medium text-amber-700 dark:text-amber-400 mb-1">Most Discussed</p>
                                <p className="text-sm text-slate-900 dark:text-slate-100 line-clamp-1">
                                    {mostControversial.answer.description.slice(0, 80)}...
                                </p>
                                <p className="text-xs text-amber-600 dark:text-amber-500 mt-1">{downvotes} downvotes</p>
                            </Link>
                        );
                    })()}
                </div>
            )}

            {/* Answers List */}
            <div className="divide-y divide-slate-200 dark:divide-slate-700">
                {sortedAnswers.map(answer => {
                    const answerId = answer.id || answer.eventId;
                    const v = votes.get(answerId);
                    return (
                        <div key={answerId} className="py-4">
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
                                    <p className="text-sm text-slate-700 dark:text-slate-300 line-clamp-2">
                                        {answer.description.slice(0, 200)}
                                        {answer.description.length > 200 ? '...' : ''}
                                    </p>

                                    <div className="flex items-center gap-3 mt-2 text-xs text-slate-500 dark:text-slate-400">
                                        <span>{formatDateTime(answer.createdAt)}</span>
                                        <span>·</span>
                                        <Link
                                            to={`/questions/${answer.questionId}`}
                                            className="text-teal-600 dark:text-teal-400 hover:text-teal-700 dark:hover:text-teal-300 transition-colors"
                                        >
                                            View question
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default UserAnswersList;
