import {memo, useMemo} from "react";
import {Link} from "react-router";
import {HugeiconsIcon} from "@hugeicons/react";
import {CheckmarkCircle02Icon as CheckmarkCircle02SolidIcon} from "@hugeicons-pro/core-solid-rounded";
import {useSelector} from "react-redux";
import type {Question} from "../types/question.types";
import {formatDateTime, markdownToText} from "../../../utils";
import EventOwner from "../../user/components/EventOwner";
import constants from "../../../constants";
import {RootState} from "../../../app/store";
import useQuestionStats from "../hooks/useQuestionStats";
import ActionItems from "../../../shared/components/ActionItems";
import {BookmarkButton} from "../../bookmark/components";
import categories from "../../../data/categories.json";

interface QuestionListItemBProps {
    question: Question;
    showPreview?: boolean;
}

/**
 * Compact Cards style question list item
 * - Full width card
 * - Title, preview, tags as pills
 * - Inline stats: votes · answers · time · author
 * - Accepted answer indicator
 */
const QuestionListItemB = memo(({question, showPreview = true}: QuestionListItemBProps) => {
    const vote = useSelector((state: RootState) => state.vote[question.id]);
    const answer = useSelector((state: RootState) => state.answer[question.id]);

    // Subscribe to vote and answer stats for this question
    useQuestionStats(question);

    const hasAcceptedAnswer = !!question.acceptedAnswerId;
    const voteCount = vote?.total ?? 0;
    const answerCount = answer?.total ?? 0;

    const categoryTitle = useMemo(() => {
        if (!question.category) return undefined;
        return categories.find(c => c.slug === question.category)?.title;
    }, [question.category]);

    return (
        <li className="py-4 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
            {/* Category badge */}
            {categoryTitle && (
                <span className="inline-flex items-center rounded-full bg-teal-50 dark:bg-teal-900/20 px-2 py-0.5 text-[10px] font-medium text-teal-700 dark:text-teal-300 ring-1 ring-inset ring-teal-600/20 dark:ring-teal-400/20 mb-1.5">
                    {categoryTitle}
                </span>
            )}

            {/* Title */}
            <Link
                to={`/questions/${question.id}`}
                className="block text-base font-semibold text-slate-900 dark:text-slate-100 hover:text-teal-600 dark:hover:text-teal-400 transition-colors line-clamp-2"
            >
                {question.title}
            </Link>

            {/* Preview */}
            {showPreview && question.description && (
                <p className="text-sm text-slate-600 dark:text-slate-400 mt-1.5 line-clamp-2">
                    {markdownToText(question.description)}
                </p>
            )}

            {/* Tags as pills */}
            {question.tags && question.tags.length > 0 && (
                <div className="flex gap-1.5 mt-2.5 flex-wrap">
                    {question.tags.map((tag, index) => (
                        <span
                            key={`${question.id}-${tag}-${index}`}
                            className="inline-flex items-center rounded bg-slate-100 dark:bg-slate-800 px-2 py-0.5 text-xs font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors cursor-pointer"
                        >
                            <span className="text-slate-400 dark:text-slate-500 mr-0.5">#</span>{tag}
                        </span>
                    ))}
                </div>
            )}

            {/* Stats and actions - always same row */}
            <div className="mt-3 flex items-center justify-between gap-2 text-xs text-slate-500 dark:text-slate-400">
                {/* Stats */}
                <div className="flex items-center gap-3 flex-wrap">
                    <span>{voteCount} votes</span>
                    <span className={`inline-flex items-center gap-1 ${
                        hasAcceptedAnswer
                            ? 'text-green-600 dark:text-green-400'
                            : answerCount > 0
                                ? 'text-teal-600 dark:text-teal-400'
                                : ''
                    }`}>
                        {hasAcceptedAnswer && (
                            <HugeiconsIcon icon={CheckmarkCircle02SolidIcon} size={14} />
                        )}
                        {answerCount} {answerCount === 1 ? 'answer' : 'answers'}
                    </span>
                    <span>{formatDateTime(question.createdAt)}</span>
                    <span className="hidden sm:inline"><EventOwner pubkey={question.user.pubkey} mini={true} /></span>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-1">
                    <BookmarkButton
                        questionId={question.id}
                        questionPubkey={question.user.pubkey}
                        size="sm"
                    />
                    <ActionItems
                        id={question.id}
                        eventId={question.eventId}
                        pubkey={question.user.pubkey}
                        kind={constants.questionKind}
                        editPath={`/questions/${question.id}/edit`}
                    />
                </div>
            </div>
        </li>
    );
});

QuestionListItemB.displayName = 'QuestionListItemB';

export default QuestionListItemB;
