import {memo} from "react";
import Skeleton from "../../../shared/components/feedback/Skeleton";

/**
 * Skeleton loader for question detail page
 * Matches the structure: header, vote column + content, tags, stats, answers
 */
const QuestionDetailSkeleton = memo(() => (
    <div className="max-w-3xl animate-pulse">
        {/* Header */}
        <header className="mb-4 sm:mb-6">
            <Skeleton height={24} className="mb-2" />
            <Skeleton height={24} width="3/4" className="mb-3" />
            <div className="flex items-center gap-3 mt-2">
                <Skeleton height={16} width="w-4" variant="circular" />
                <Skeleton height={12} width="w-20" />
                <Skeleton height={12} width="w-24" />
            </div>
        </header>

        {/* Question body */}
        <div className="flex gap-4">
            {/* Vote column - hidden on mobile */}
            <div className="shrink-0 hidden sm:flex flex-col items-center gap-2">
                <Skeleton height={32} width="w-8" />
                <Skeleton height={20} width="w-6" />
                <Skeleton height={32} width="w-8" />
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
                {/* Description - multiple paragraphs */}
                <div className="space-y-3">
                    <TextBlockSkeleton />
                    <TextBlockSkeleton lines={2} lastLineWidth="4/5" />
                    <TextBlockSkeleton lines={2} lastLineWidth="3/4" />
                </div>

                {/* Tags */}
                <div className="flex gap-1.5 mt-6 flex-wrap">
                    <Skeleton height={20} width="w-16" />
                    <Skeleton height={20} width="w-14" />
                    <Skeleton height={20} width="w-20" />
                </div>

                {/* Footer actions */}
                <div className="flex items-center gap-4 mt-6">
                    <Skeleton height={16} width="w-12" />
                    <Skeleton height={16} width="w-10" />
                </div>
            </div>
        </div>

        {/* Answers section */}
        <div className="mt-8 pt-6 border-t border-slate-200 dark:border-slate-700">
            <Skeleton height={20} width="w-24" className="mb-4" />

            <div className="space-y-6">
                <AnswerSkeleton />
                <AnswerSkeleton />
            </div>
        </div>
    </div>
));

/** Helper: block of text lines */
const TextBlockSkeleton = memo(({
    lines = 3,
    lastLineWidth = '5/6'
}: {
    lines?: number;
    lastLineWidth?: string;
}) => (
    <div className="space-y-2">
        {[...Array(lines - 1)].map((_, i) => (
            <Skeleton key={i} height={16} />
        ))}
        <Skeleton height={16} width={lastLineWidth} />
    </div>
));

TextBlockSkeleton.displayName = 'TextBlockSkeleton';

/** Helper: single answer skeleton */
const AnswerSkeleton = memo(() => (
    <div className="flex gap-4">
        {/* Vote column */}
        <div className="shrink-0 hidden sm:flex flex-col items-center gap-2">
            <Skeleton height={24} width="w-6" />
            <Skeleton height={16} width="w-5" />
            <Skeleton height={24} width="w-6" />
        </div>
        {/* Content */}
        <div className="flex-1 space-y-2">
            <Skeleton height={16} />
            <Skeleton height={16} />
            <Skeleton height={16} width="2/3" />
            <div className="flex items-center gap-3 mt-3">
                <Skeleton height={12} width="w-16" />
                <Skeleton height={12} width="w-20" />
            </div>
        </div>
    </div>
));

AnswerSkeleton.displayName = 'AnswerSkeleton';

QuestionDetailSkeleton.displayName = 'QuestionDetailSkeleton';

export default QuestionDetailSkeleton;
