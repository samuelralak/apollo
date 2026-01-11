import { useCallback, useMemo, useState } from "react";
import { useSelector } from "react-redux";
import { useUpdateEffect } from "@react-hookz/web";
import type { NDKEvent, NDKFilter } from "@nostr-dev-kit/ndk";
import { RootState } from "../../../app/store";
import useNDKSubscription, { EventHandlingMode, ResourceType } from "../../../shared/hooks/useNDKSubscription";
import constants from "../../../constants";
import { followListTransformer } from "../services/follow.transformer";

interface UseUserFollowingReturn {
    /** Pubkeys of users this user follows */
    followingPubkeys: string[];
    /** Number of users this user follows */
    count: number;
    /** Loading state */
    loading: boolean;
    /** Whether initial load is complete */
    initialized: boolean;
}

/**
 * Hook to fetch who a specific user follows (for profile display)
 *
 * This is a read-only hook - use useFollows for follow/unfollow actions
 *
 * IMPORTANT: When viewing the current user's profile, this hook returns data
 * from Redux (populated by useFollows) to avoid "late joiner" subscription
 * conflicts. Both hooks use the same filter, so the second to subscribe would
 * miss events if they created separate subscriptions.
 *
 * @param pubkey - The user's pubkey to fetch following list for
 */
// Stable empty return for stale state (prevents new object creation every render)
const EMPTY_FOLLOWING_RETURN: UseUserFollowingReturn = {
    followingPubkeys: [],
    count: 0,
    loading: true,
    initialized: false
};

const useUserFollowing = (pubkey: string | undefined): UseUserFollowingReturn => {
    // Check if viewing current user's profile (Redux has the data via useFollows)
    const auth = useSelector((state: RootState) => state.auth);
    const followState = useSelector((state: RootState) => state.follow);
    const isOwnProfile = pubkey && auth.isLoggedIn && pubkey === auth.pubkey;

    // Track which pubkey the current state belongs to (prevents showing stale data)
    const [stateForPubkey, setStateForPubkey] = useState<string | undefined>(undefined);
    const [followingPubkeys, setFollowingPubkeys] = useState<string[]>([]);
    const [initialized, setInitialized] = useState(false);
    const [loading, setLoading] = useState(true);

    // Data is stale if it belongs to a different pubkey (prevents flash of old data)
    const isStale = !isOwnProfile && stateForPubkey !== pubkey;

    // Reset state when pubkey changes (useUpdateEffect skips initial mount)
    useUpdateEffect(() => {
        setStateForPubkey(undefined);
        setFollowingPubkeys([]);
        setInitialized(false);
        setLoading(true);
    }, [pubkey]);

    // Build filter for the user's kind 3 event
    // Disable subscription for own profile (use Redux data instead)
    const filters = useMemo<NDKFilter | null>(() => {
        if (!pubkey || isOwnProfile) return null;
        return {
            kinds: [constants.contactListKind as number],
            authors: [pubkey]
        };
    }, [pubkey, isOwnProfile]);

    // IMPORTANT: Derive pubkey from event.pubkey, NOT from closure.
    // This prevents race condition where useSyncedRef updates callback during render
    // but old subscription events arrive before cleanup effect runs.
    const handleFollowEvent = useCallback((event: NDKEvent) => {
        const list = followListTransformer(event);
        // event.pubkey is the author of the kind 3 event (the user whose following list this is)
        setStateForPubkey(event.pubkey);
        setFollowingPubkeys(list.followedPubkeys);
        setLoading(false);
    }, []);

    // For EOSE, we can't derive pubkey from the event.
    // Only set stateForPubkey if it hasn't been set by events yet (empty following list case)
    const handleEose = useCallback(() => {
        setStateForPubkey(prev => prev ?? pubkey);
        setInitialized(true);
        setLoading(false);
    }, [pubkey]);

    // Subscribe to the user's follow list (only for OTHER users' profiles)
    useNDKSubscription(
        filters ?? { kinds: [] },
        handleFollowEvent,
        handleEose,
        {
            ndkOptions: { closeOnEose: false },
            mode: EventHandlingMode.IMMEDIATE,
            resourceType: ResourceType.FOLLOW,
            context: { parentId: `following-${pubkey}` },
            enabled: !!filters
        }
    );

    // For own profile, return Redux data from useFollows
    if (isOwnProfile) {
        return {
            followingPubkeys: followState.list?.followedPubkeys ?? [],
            count: followState.list?.followedPubkeys.length ?? 0,
            loading: followState.loading,
            initialized: followState.initialized
        };
    }

    // If data is stale (from previous profile), return stable empty object
    // This prevents flash of old data when navigating between profiles
    if (isStale) {
        return EMPTY_FOLLOWING_RETURN;
    }

    return {
        followingPubkeys,
        count: followingPubkeys.length,
        loading,
        initialized
    };
};

export default useUserFollowing;
