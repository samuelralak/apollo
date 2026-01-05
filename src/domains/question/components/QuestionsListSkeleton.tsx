import {memo} from "react";
import QuestionListItemSkeleton from "./QuestionListItemSkeleton";

interface QuestionsListSkeletonProps {
    count?: number;
}

/**
 * Skeleton loader for the questions list
 * Shows multiple skeleton question items
 */
const QuestionsListSkeleton = memo(({count = 5}: QuestionsListSkeletonProps) => (
    <div>
        {/* Header skeleton */}
        <div className="mb-2">
            <div className="h-3 w-20 bg-slate-200 dark:bg-slate-700 rounded animate-pulse" />
        </div>

        {/* Questions list skeleton */}
        <ul className="flex flex-col divide-y divide-slate-100 dark:divide-slate-800">
            {[...Array(count)].map((_, i) => (
                <QuestionListItemSkeleton key={i} />
            ))}
        </ul>
    </div>
));

QuestionsListSkeleton.displayName = 'QuestionsListSkeleton';

export default QuestionsListSkeleton;
