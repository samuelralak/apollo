import { useContext, useCallback, useMemo, useRef } from "react";
import { useUnmountEffect } from "@react-hookz/web";
import { useDispatch, useSelector } from "react-redux";
import type { NDKEvent, NDKFilter } from "@nostr-dev-kit/ndk";
import { NDKContext } from "../../../lib/ndk/NDKProvider";
import { AppDispatch, RootState } from "../../../app/store";
import useNDKSubscription, { EventHandlingMode, ResourceType } from "../../../shared/hooks/useNDKSubscription";
import { showToast } from "../../../shared/store/toast.slice";
import constants from "../../../constants";
import {
    setFollowList,
    addFollowOptimistic,
    removeFollowOptimistic,
    revertFollowOperation,
    setFollowInitialized
} from "../store/follow.slice";
import {
    followListTransformer,
    buildFollowTags,
    isValidPubkey
} from "../services/follow.transformer";

interface UseFollowsReturn {
    /** Whether the current user is following a pubkey */
    isFollowing: (pubkey: string) => boolean;
    /** Toggle follow state for a user */
    toggleFollow: (pubkey: string) => Promise<void>;
    /** Follow a user */
    follow: (pubkey: string) => Promise<void>;
    /** Unfollow a user */
    unfollow: (pubkey: string) => Promise<void>;
    /** All followed pubkeys */
    followedPubkeys: string[];
    /** Total following count */
    followingCount: number;
    /** Loading state */
    loading: boolean;
    /** Whether the user is logged in (can follow) */
    canFollow: boolean;
    /** Check if operation is pending for a pubkey */
    isPending: (pubkey: string) => boolean;
    /** Whether follow list has been initialized */
    initialized: boolean;
}

/**
 * Hook for managing the current user's follow list (NIP-02 kind 3)
 *
 * Features:
 * - Subscribes to current user's kind 3 event
 * - Optimistic updates with rollback on failure
 * - Debounced publishing to handle rapid toggles
 * - Works with NIP-02 replaceable event semantics
 */
const useFollows = (): UseFollowsReturn => {
    const { publishEvent } = useContext(NDKContext) as NDKContext;
    const dispatch = useDispatch<AppDispatch>();

    // Auth state
    const auth = useSelector((state: RootState) => state.auth);
    const isLoggedIn = auth.isLoggedIn;
    const userPubkey = auth.pubkey;

    // Follow state
    const followState = useSelector((state: RootState) => state.follow);
    const followedPubkeys = useMemo(
        () => followState.list?.followedPubkeys ?? [],
        [followState.list?.followedPubkeys]
    );

    // Debounce timer ref for rapid toggle handling
    const publishTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const pendingPublishRef = useRef<string[] | null>(null);

    // Cleanup timeout on unmount to prevent memory leaks
    useUnmountEffect(() => {
        if (publishTimeoutRef.current) {
            clearTimeout(publishTimeoutRef.current);
        }
    });

    // Subscribe to current user's follow list (only when logged in)
    const filters = useMemo<NDKFilter | null>(() => {
        if (!isLoggedIn || !userPubkey) return null;
        return {
            kinds: [constants.contactListKind as number],
            authors: [userPubkey]
        };
    }, [isLoggedIn, userPubkey]);

    const handleFollowEvent = useCallback((event: NDKEvent) => {
        const list = followListTransformer(event);
        dispatch(setFollowList(list));
    }, [dispatch]);

    const handleEose = useCallback(() => {
        // Mark as initialized even if no follow list exists
        dispatch(setFollowInitialized());
    }, [dispatch]);

    // Subscribe when user is logged in
    useNDKSubscription(
        filters ?? { kinds: [] },
        handleFollowEvent,
        handleEose,
        {
            ndkOptions: { closeOnEose: false },
            mode: EventHandlingMode.IMMEDIATE,
            resourceType: ResourceType.FOLLOW,
            enabled: !!filters
        }
    );

    // Check if following a pubkey
    const isFollowing = useCallback((pubkey: string): boolean => {
        return followedPubkeys.includes(pubkey);
    }, [followedPubkeys]);

    // Check if operation is pending
    const isPending = useCallback((pubkey: string): boolean => {
        return pubkey in followState.pendingOperations;
    }, [followState.pendingOperations]);

    // Publish updated follow list
    const publishFollowList = useCallback(async (newPubkeys: string[]): Promise<void> => {
        if (!userPubkey) return;

        const tags = buildFollowTags(newPubkeys);
        await publishEvent(constants.contactListKind, '', tags);
    }, [userPubkey, publishEvent]);

    // Follow a user with optimistic update
    const follow = useCallback(async (pubkey: string): Promise<void> => {
        if (!isLoggedIn || !userPubkey) {
            dispatch(showToast({ title: 'Sign in to follow', subtitle: 'You need to be signed in to follow users.', type: 'warning' }));
            return;
        }

        if (!isValidPubkey(pubkey)) {
            dispatch(showToast({ title: 'Invalid user', type: 'error' }));
            return;
        }

        // Can't follow yourself
        if (pubkey === userPubkey) {
            return;
        }

        // Already following
        if (followedPubkeys.includes(pubkey)) return;

        // Optimistic update
        dispatch(addFollowOptimistic(pubkey));

        // Cancel any pending publish and schedule new one
        if (publishTimeoutRef.current) {
            clearTimeout(publishTimeoutRef.current);
        }

        // Build new pubkey array
        const newPubkeys = [...followedPubkeys, pubkey];
        pendingPublishRef.current = newPubkeys;

        // Debounce publish by 300ms to handle rapid toggles
        publishTimeoutRef.current = setTimeout(async () => {
            try {
                await publishFollowList(pendingPublishRef.current!);
                dispatch(showToast({ title: 'Now following', type: 'success' }));
            } catch {
                dispatch(revertFollowOperation({ pubkey, operation: 'add' }));
                dispatch(showToast({ title: 'Failed to follow', subtitle: 'Please try again.', type: 'error' }));
            }
        }, 300);
    }, [isLoggedIn, userPubkey, followedPubkeys, dispatch, publishFollowList]);

    // Unfollow a user with optimistic update
    const unfollow = useCallback(async (pubkey: string): Promise<void> => {
        if (!isLoggedIn || !userPubkey) return;

        // Not following
        if (!followedPubkeys.includes(pubkey)) return;

        // Optimistic update
        dispatch(removeFollowOptimistic(pubkey));

        // Cancel any pending publish and schedule new one
        if (publishTimeoutRef.current) {
            clearTimeout(publishTimeoutRef.current);
        }

        // Build new pubkey array without the unfollowed user
        const newPubkeys = followedPubkeys.filter(p => p !== pubkey);
        pendingPublishRef.current = newPubkeys;

        // Debounce publish
        publishTimeoutRef.current = setTimeout(async () => {
            try {
                await publishFollowList(pendingPublishRef.current!);
                dispatch(showToast({ title: 'Unfollowed', type: 'success' }));
            } catch {
                dispatch(revertFollowOperation({ pubkey, operation: 'remove' }));
                dispatch(showToast({ title: 'Failed to unfollow', subtitle: 'Please try again.', type: 'error' }));
            }
        }, 300);
    }, [isLoggedIn, userPubkey, followedPubkeys, dispatch, publishFollowList]);

    // Toggle follow
    const toggleFollow = useCallback(async (pubkey: string): Promise<void> => {
        if (isFollowing(pubkey)) {
            await unfollow(pubkey);
        } else {
            await follow(pubkey);
        }
    }, [isFollowing, follow, unfollow]);

    return {
        isFollowing,
        toggleFollow,
        follow,
        unfollow,
        followedPubkeys,
        followingCount: followedPubkeys.length,
        loading: followState.loading,
        canFollow: isLoggedIn,
        isPending,
        initialized: followState.initialized
    };
};

export default useFollows;
