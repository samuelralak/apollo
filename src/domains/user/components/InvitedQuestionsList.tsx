import { useMemo } from "react";
import { Link } from "react-router";
import { HugeiconsIcon } from "@hugeicons/react";
import { CheckmarkCircle02Icon } from "@hugeicons-pro/core-solid-rounded";
import { Clock01Icon } from "@hugeicons-pro/core-twotone-rounded";
import type { Question } from "../../question/types/question.types";
import type { Answer } from "../../answer/types/answer.types";
import { formatDateTime } from "../../../utils";
import EventOwner from "./EventOwner";

interface InvitedQuestionsListProps {
    questions: Question[];
    answers: Answer[];
    targetPubkey: string;
    loading: boolean;
    initialized: boolean;
}

const InvitedQuestionsListSkeleton = () => (
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
                <div className="flex gap-2 mt-2">
                    <div className="h-5 w-14 bg-slate-200 dark:bg-slate-700 rounded" />
                    <div className="h-5 w-16 bg-slate-200 dark:bg-slate-700 rounded" />
                </div>
            </div>
        ))}
    </div>
);

const InvitedQuestionsList = ({
    questions,
    answers,
    targetPubkey,
    loading,
    initialized
}: InvitedQuestionsListProps) => {
    // Calculate which questions the target user has answered
    const answeredIds = useMemo(() => {
        const userAnswers = answers.filter(a => a.user.pubkey === targetPubkey);
        return new Set(userAnswers.map(a => a.questionId));
    }, [answers, targetPubkey]);

    const hasAnswered = (questionId: string) => answeredIds.has(questionId);

    if (loading || !initialized) {
        return <InvitedQuestionsListSkeleton />;
    }

    if (questions.length === 0) {
        return (
            <div className="text-center py-12">
                <p className="text-slate-500 dark:text-slate-400">
                    No questions asked to this user yet
                </p>
            </div>
        );
    }

    return (
        <div>
            {/* Stats Summary */}
            <div className="flex flex-wrap gap-x-6 gap-y-2 mb-4 text-sm">
                <span className="text-slate-600 dark:text-slate-400">
                    <span className="font-semibold text-slate-900 dark:text-slate-100">{questions.length}</span> questions
                </span>
                <span className="text-slate-600 dark:text-slate-400">
                    <span className="font-semibold text-green-600 dark:text-green-400">{answeredIds.size}</span> answered
                </span>
                <span className="text-slate-600 dark:text-slate-400">
                    <span className="font-semibold text-amber-600 dark:text-amber-400">{questions.length - answeredIds.size}</span> pending
                </span>
            </div>

            {/* Questions List */}
            <div className="divide-y divide-slate-200 dark:divide-slate-700">
                {questions.map(question => {
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

                                <div className="min-w-0 flex-1">
                                    <Link
                                        to={`/questions/${question.id}`}
                                        className="text-slate-900 dark:text-slate-100 hover:text-teal-600 dark:hover:text-teal-400 font-medium transition-colors"
                                    >
                                        {question.title}
                                    </Link>

                                    <div className="flex items-center gap-4 mt-1.5 text-xs text-slate-500 dark:text-slate-400">
                                        <span>Asked by <EventOwner pubkey={question.user.pubkey} mini={true} /></span>
                                        <span>{formatDateTime(question.createdAt)}</span>
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

export default InvitedQuestionsList;
