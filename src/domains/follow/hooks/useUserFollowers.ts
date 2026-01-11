import { useCallback, useMemo, useState } from "react";
import { useUpdateEffect } from "@react-hookz/web";
import type { NDKEvent, NDKFilter } from "@nostr-dev-kit/ndk";
import useNDKSubscription, { EventHandlingMode, ResourceType } from "../../../shared/hooks/useNDKSubscription";
import constants from "../../../constants";

interface UseUserFollowersReturn {
    /** Pubkeys of users who follow this user */
    followersPubkeys: string[];
    /** Number of followers */
    count: number;
    /** Loading state */
    loading: boolean;
    /** Whether initial load is complete */
    initialized: boolean;
}

/**
 * Hook to fetch who follows a specific user (for profile display)
 *
 * Queries kind 3 events where the user's pubkey appears in a p tag.
 * Each event author is a follower.
 *
 * @param pubkey - The user's pubkey to fetch followers for
 */
const useUserFollowers = (pubkey: string | undefined): UseUserFollowersReturn => {
    // Use Map for O(1) lookups and automatic deduplication
    const [followersMap, setFollowersMap] = useState<Map<string, boolean>>(new Map());
    const [initialized, setInitialized] = useState(false);
    const [loading, setLoading] = useState(true);

    // Reset state when pubkey changes (useUpdateEffect skips initial mount)
    useUpdateEffect(() => {
        setFollowersMap(new Map());
        setInitialized(false);
        setLoading(true);
    }, [pubkey]);

    // Build filter: kind 3 events that contain this pubkey in a p tag
    const filters = useMemo<NDKFilter | null>(() => {
        if (!pubkey) return null;
        return {
            kinds: [constants.contactListKind as number],
            "#p": [pubkey]
        };
    }, [pubkey]);

    const handleFollowerEvent = useCallback((event: NDKEvent) => {
        // The event author is someone who follows the target user
        const followerPubkey = event.pubkey;
        setFollowersMap(prev => {
            if (prev.has(followerPubkey)) return prev;
            const next = new Map(prev);
            next.set(followerPubkey, true);
            return next;
        });
    }, []);

    const handleEose = useCallback(() => {
        setInitialized(true);
        setLoading(false);
    }, []);

    // Subscribe to kind 3 events containing the target pubkey
    useNDKSubscription(
        filters ?? { kinds: [] },
        handleFollowerEvent,
        handleEose,
        {
            ndkOptions: { closeOnEose: false },
            mode: EventHandlingMode.IMMEDIATE,
            resourceType: ResourceType.FOLLOW,
            context: { parentId: `followers-${pubkey}` },
            enabled: !!filters
        }
    );

    // Convert Map keys to array
    const followersPubkeys = useMemo(
        () => Array.from(followersMap.keys()),
        [followersMap]
    );

    return {
        followersPubkeys,
        count: followersPubkeys.length,
        loading,
        initialized
    };
};

export default useUserFollowers;
