import { memo } from "react";
import { HugeiconsIcon } from "@hugeicons/react";
import { Bookmark02Icon } from "@hugeicons-pro/core-twotone-rounded";
import { Bookmark02Icon as BookmarkSolidIcon } from "@hugeicons-pro/core-solid-rounded";
import { classNames } from "../../../utils";
import useBookmarks from "../hooks/useBookmarks";

interface BookmarkButtonProps {
    /** Question identifier (d tag) */
    questionId: string;
    /** Question author's pubkey */
    questionPubkey: string;
    /** Show label text */
    showLabel?: boolean;
    /** Size variant */
    size?: 'sm' | 'md';
    /** Additional CSS classes */
    className?: string;
}

/**
 * Bookmark toggle button for questions
 *
 * Features:
 * - Optimistic UI (instant feedback)
 * - Loading state during pending operations
 * - Hidden when not logged in
 * - Dark mode support
 */
const BookmarkButton = memo(({
    questionId,
    questionPubkey,
    showLabel = false,
    size = 'md',
    className = ''
}: BookmarkButtonProps) => {
    const {
        isBookmarked,
        toggleBookmark,
        canBookmark,
        isPending
    } = useBookmarks();

    const bookmarked = isBookmarked(questionId, questionPubkey);
    const pending = isPending(questionId, questionPubkey);

    const handleClick = async (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        await toggleBookmark(questionId, questionPubkey);
    };

    const iconSize = size === 'sm' ? 18 : 22;

    // Don't render if user is not logged in
    if (!canBookmark) {
        return null;
    }

    return (
        <button
            type="button"
            onClick={handleClick}
            disabled={pending}
            className={classNames(
                'inline-flex items-center gap-1.5 rounded-md transition-colors',
                'focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-600 dark:focus-visible:ring-teal-500',
                pending ? 'opacity-50 cursor-wait' : 'cursor-pointer',
                bookmarked
                    ? 'text-amber-500 hover:text-amber-600 dark:text-amber-400 dark:hover:text-amber-300'
                    : 'text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300',
                size === 'sm' ? 'p-1' : 'p-1.5',
                className
            )}
            aria-label={bookmarked ? 'Remove bookmark' : 'Add bookmark'}
            title={bookmarked ? 'Remove bookmark' : 'Bookmark this question'}
        >
            <HugeiconsIcon
                icon={bookmarked ? BookmarkSolidIcon : Bookmark02Icon}
                size={iconSize}
                className={pending ? 'animate-pulse' : ''}
            />
            {showLabel && (
                <span className={classNames(
                    'font-medium',
                    size === 'sm' ? 'text-xs' : 'text-sm'
                )}>
                    {bookmarked ? 'Saved' : 'Save'}
                </span>
            )}
        </button>
    );
});

BookmarkButton.displayName = 'BookmarkButton';

export default BookmarkButton;
