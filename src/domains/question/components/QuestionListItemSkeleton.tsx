import {memo} from "react";
import Skeleton from "../../../shared/components/feedback/Skeleton";

/**
 * Skeleton loader for QuestionListItemB
 * Matches the structure: title, preview, tags, stats row
 */
const QuestionListItemSkeleton = memo(() => (
    <li className="py-4 animate-pulse">
        {/* Title */}
        <Skeleton height={20} width="3/4" />

        {/* Preview - 2 lines */}
        <div className="mt-2 space-y-1.5">
            <Skeleton height={16} />
            <Skeleton height={16} width="2/3" />
        </div>

        {/* Tags */}
        <div className="flex gap-1.5 mt-2.5">
            <Skeleton height={20} width="w-14" variant="rounded" />
            <Skeleton height={20} width="w-16" variant="rounded" />
            <Skeleton height={20} width="w-12" variant="rounded" />
        </div>

        {/* Stats row */}
        <div className="mt-3 flex items-center gap-3">
            <Skeleton height={12} width="w-16" />
            <Skeleton height={12} width="w-20" />
            <Skeleton height={12} width="w-14" />
        </div>
    </li>
));

QuestionListItemSkeleton.displayName = 'QuestionListItemSkeleton';

export default QuestionListItemSkeleton;
