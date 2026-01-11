import { useCallback, useMemo, useState } from "react";
import { useUpdateEffect } from "@react-hookz/web";
import type { NDKEvent, NDKFilter } from "@nostr-dev-kit/ndk";
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
 * @param pubkey - The user's pubkey to fetch following list for
 */
const useUserFollowing = (pubkey: string | undefined): UseUserFollowingReturn => {
    const [followingPubkeys, setFollowingPubkeys] = useState<string[]>([]);
    const [initialized, setInitialized] = useState(false);
    const [loading, setLoading] = useState(true);

    // Reset state when pubkey changes (useUpdateEffect skips initial mount)
    useUpdateEffect(() => {
        setFollowingPubkeys([]);
        setInitialized(false);
        setLoading(true);
    }, [pubkey]);

    // Build filter for the user's kind 3 event
    const filters = useMemo<NDKFilter | null>(() => {
        if (!pubkey) return null;
        return {
            kinds: [constants.contactListKind as number],
            authors: [pubkey]
        };
    }, [pubkey]);

    const handleFollowEvent = useCallback((event: NDKEvent) => {
        const list = followListTransformer(event);
        setFollowingPubkeys(list.followedPubkeys);
        setLoading(false);
    }, []);

    const handleEose = useCallback(() => {
        setInitialized(true);
        setLoading(false);
    }, []);

    // Subscribe to the user's follow list
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

    return {
        followingPubkeys,
        count: followingPubkeys.length,
        loading,
        initialized
    };
};

export default useUserFollowing;
