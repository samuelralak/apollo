import { memo, useState, useCallback, startTransition } from "react";
import { useUpdateEffect } from "@react-hookz/web";
import EventOwner from "../../user/components/EventOwner";
import FollowButton from "./FollowButton";

interface FollowingListProps {
    /** Pubkeys of users being followed */
    followingPubkeys: string[];
    /** Whether data is still loading */
    loading: boolean;
    /** Whether initial load is complete */
    initialized: boolean;
}

const PAGE_SIZE = 20;

/**
 * Displays list of users that a specific user follows.
 *
 * NOTE: Data must be passed from parent to avoid "late joiner" subscription issue.
 * When the same filter is used in multiple hooks, later subscribers miss events
 * that were already processed.
 */
const FollowingList = memo(({ followingPubkeys, loading, initialized }: FollowingListProps) => {
    const [displayCount, setDisplayCount] = useState(PAGE_SIZE);

    // Reset pagination when data changes (e.g., navigating to another profile)
    // useUpdateEffect skips initial mount to avoid lint warning about setState in effect
    useUpdateEffect(() => {
        setDisplayCount(PAGE_SIZE);
    }, [followingPubkeys]);

    const showMore = useCallback(() => {
        startTransition(() => {
            setDisplayCount(prev => prev + PAGE_SIZE);
        });
    }, []);

    // If we have data, show it (even if still loading more)
    if (followingPubkeys.length > 0) {
        const visiblePubkeys = followingPubkeys.slice(0, displayCount);
        const hasMore = displayCount < followingPubkeys.length;
        const remaining = followingPubkeys.length - displayCount;

        return (
            <div>
                <div className="divide-y divide-slate-100 dark:divide-slate-800">
                    {visiblePubkeys.map((followingPubkey) => (
                        <div
                            key={followingPubkey}
                            className="flex items-center justify-between gap-3 py-3 first:pt-0 overflow-hidden"
                        >
                            <div className="flex-1 min-w-0 overflow-hidden">
                                <EventOwner pubkey={followingPubkey} />
                            </div>
                            <div className="flex-shrink-0">
                                <FollowButton pubkey={followingPubkey} size="sm" />
                            </div>
                        </div>
                    ))}
                </div>
                {hasMore && (
                    <button
                        type="button"
                        onClick={showMore}
                        className="mt-4 w-full py-2 text-sm font-medium text-teal-600 dark:text-teal-400 hover:text-teal-700 dark:hover:text-teal-300 border border-slate-200 dark:border-slate-700 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                    >
                        Show {Math.min(remaining, PAGE_SIZE)} more ({remaining} remaining)
                    </button>
                )}
            </div>
        );
    }

    // No data yet - show skeleton if still loading/not initialized
    if (loading || !initialized) {
        return (
            <div className="divide-y divide-slate-100 dark:divide-slate-800">
                {[...Array(5)].map((_, i) => (
                    <div key={i} className="flex items-center justify-between py-3 animate-pulse">
                        <div className="flex items-center gap-3">
                            <div className="h-10 w-10 bg-slate-200 dark:bg-slate-700 rounded-lg" />
                            <div className="space-y-2">
                                <div className="h-4 w-24 bg-slate-200 dark:bg-slate-700 rounded" />
                                <div className="h-3 w-32 bg-slate-200 dark:bg-slate-700 rounded" />
                            </div>
                        </div>
                        <div className="h-8 w-20 bg-slate-200 dark:bg-slate-700 rounded-full" />
                    </div>
                ))}
            </div>
        );
    }

    // Initialized with no data - show empty state
    return (
        <div className="text-center py-8 md:py-12">
            <p className="text-slate-500 dark:text-slate-400">
                Not following anyone yet
            </p>
        </div>
    );
});

FollowingList.displayName = 'FollowingList';

export default FollowingList;
