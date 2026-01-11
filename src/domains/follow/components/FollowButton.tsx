import { memo, useState } from "react";
import { useSelector } from "react-redux";
import { RootState } from "../../../app/store";
import { classNames } from "../../../utils";
import useFollows from "../hooks/useFollows";

interface FollowButtonProps {
    /** User pubkey to follow/unfollow */
    pubkey: string;
    /** Size variant */
    size?: 'sm' | 'md';
    /** Additional CSS classes */
    className?: string;
}

/**
 * Follow/Unfollow toggle button for user profiles
 *
 * Features:
 * - Optimistic UI (instant feedback)
 * - Hover state shows "Unfollow" when following
 * - Loading state during pending operations
 * - Hidden when viewing own profile or not logged in
 */
const FollowButton = memo(({
    pubkey,
    size = 'md',
    className = ''
}: FollowButtonProps) => {
    const [isHovered, setIsHovered] = useState(false);

    const auth = useSelector((state: RootState) => state.auth);
    const currentUserPubkey = auth.pubkey;

    const {
        isFollowing,
        toggleFollow,
        canFollow,
        isPending
    } = useFollows();

    const following = isFollowing(pubkey);
    const pending = isPending(pubkey);

    // Don't render if user is not logged in
    if (!canFollow) {
        return null;
    }

    // Don't render for own profile
    if (pubkey === currentUserPubkey) {
        return null;
    }

    const handleClick = async (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        await toggleFollow(pubkey);
    };

    // Determine button text
    const getButtonText = () => {
        if (pending) return 'Loading...';
        if (following && isHovered) return 'Unfollow';
        if (following) return 'Following';
        return 'Follow';
    };

    // Size-based styles
    const sizeStyles = size === 'sm'
        ? 'px-3 py-1 text-xs'
        : 'px-4 py-1.5 text-sm';

    // State-based styles
    const getButtonStyles = () => {
        if (pending) {
            return 'bg-slate-200 dark:bg-slate-700 text-slate-400 dark:text-slate-500 cursor-wait';
        }
        if (following && isHovered) {
            // Hover on following - red unfollow state
            return 'bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 border-red-300 dark:border-red-700 hover:bg-red-100 dark:hover:bg-red-900/50';
        }
        if (following) {
            // Following state - outlined teal
            return 'bg-transparent text-teal-600 dark:text-teal-400 border-teal-500 dark:border-teal-600 hover:bg-teal-50 dark:hover:bg-teal-900/30';
        }
        // Not following - filled teal
        return 'bg-teal-600 dark:bg-teal-500 text-white border-transparent hover:bg-teal-700 dark:hover:bg-teal-600';
    };

    return (
        <button
            type="button"
            onClick={handleClick}
            disabled={pending}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            className={classNames(
                'inline-flex items-center justify-center font-medium rounded-full border transition-colors',
                'focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-600 dark:focus-visible:ring-teal-500 focus-visible:ring-offset-2',
                sizeStyles,
                getButtonStyles(),
                className
            )}
            aria-label={following ? 'Unfollow user' : 'Follow user'}
        >
            {getButtonText()}
        </button>
    );
});

FollowButton.displayName = 'FollowButton';

export default FollowButton;
