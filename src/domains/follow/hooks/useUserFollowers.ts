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

// Stable empty return for stale state (prevents new object creation every render)
const EMPTY_FOLLOWERS_RETURN: UseUserFollowersReturn = {
    followersPubkeys: [],
    count: 0,
    loading: true,
    initialized: false
};

/**
 * Extract the target pubkey from a kind 3 event's p-tags.
 * Returns the pubkey that this event "follows" which matches our filter.
 */
const extractTargetPubkey = (event: NDKEvent, targetPubkey: string | undefined): string | undefined => {
    if (!targetPubkey) return undefined;
    // Check if any p-tag contains the target pubkey
    for (const tag of event.tags) {
        if (tag[0] === 'p' && tag[1] === targetPubkey) {
            return targetPubkey;
        }
    }
    return undefined;
};

/**
 * Hook to fetch who follows a specific user (for profile display)
 *
 * Queries kind 3 events where the user's pubkey appears in a p tag.
 * Each event author is a follower.
 *
 * @param pubkey - The user's pubkey to fetch followers for
 */
const useUserFollowers = (pubkey: string | undefined): UseUserFollowersReturn => {
    // Track which pubkey the current state belongs to (prevents showing stale data)
    const [stateForPubkey, setStateForPubkey] = useState<string | undefined>(undefined);
    // Use Map for O(1) lookups and automatic deduplication
    const [followersMap, setFollowersMap] = useState<Map<string, boolean>>(new Map());
    const [initialized, setInitialized] = useState(false);
    const [loading, setLoading] = useState(true);

    // Data is stale if it belongs to a different pubkey (prevents flash of old data)
    const isStale = stateForPubkey !== pubkey;

    // Reset state when pubkey changes (useUpdateEffect skips initial mount)
    useUpdateEffect(() => {
        setStateForPubkey(undefined);
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

    // IMPORTANT: Verify event belongs to current filter by checking p-tags.
    // This prevents race condition where late events from old subscription
    // arrive after callback is updated but before cleanup effect runs.
    const handleFollowerEvent = useCallback((event: NDKEvent) => {
        // Extract which pubkey this event is "for" by checking p-tags
        const eventTargetPubkey = extractTargetPubkey(event, pubkey);
        if (!eventTargetPubkey) return; // Event doesn't match current filter, ignore

        const followerPubkey = event.pubkey;
        setStateForPubkey(eventTargetPubkey);
        setFollowersMap(prev => {
            if (prev.has(followerPubkey)) return prev;
            const next = new Map(prev);
            next.set(followerPubkey, true);
            return next;
        });
    }, [pubkey]);

    // For EOSE, only set stateForPubkey if it hasn't been set by events yet (no followers case)
    const handleEose = useCallback(() => {
        setStateForPubkey(prev => prev ?? pubkey);
        setInitialized(true);
        setLoading(false);
    }, [pubkey]);

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

    // If data is stale (from previous profile), return stable empty object
    // This prevents flash of old data when navigating between profiles
    if (isStale) {
        return EMPTY_FOLLOWERS_RETURN;
    }

    return {
        followersPubkeys,
        count: followersPubkeys.length,
        loading,
        initialized
    };
};

export default useUserFollowers;
