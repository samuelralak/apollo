import { useContext, useCallback, useMemo, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import type { NDKEvent, NDKFilter } from "@nostr-dev-kit/ndk";
import { NDKContext } from "../../../lib/ndk/NDKProvider";
import { AppDispatch, RootState } from "../../../app/store";
import useNDKSubscription, { EventHandlingMode, ResourceType } from "../../../shared/hooks/useNDKSubscription";
import { showToast } from "../../../shared/store/toast.slice";
import constants from "../../../constants";
import {
    setBookmarkList,
    addBookmarkOptimistic,
    removeBookmarkOptimistic,
    revertBookmarkOperation,
    setBookmarkInitialized
} from "../store/bookmark.slice";
import {
    bookmarkListTransformer,
    buildQuestionCoordinate,
    buildBookmarkTags
} from "../services/bookmark.transformer";

interface UseBookmarksReturn {
    /** Whether a question is bookmarked */
    isBookmarked: (questionId: string, questionPubkey: string) => boolean;
    /** Toggle bookmark state for a question */
    toggleBookmark: (questionId: string, questionPubkey: string) => Promise<void>;
    /** Add a bookmark */
    addBookmark: (questionId: string, questionPubkey: string) => Promise<void>;
    /** Remove a bookmark */
    removeBookmark: (questionId: string, questionPubkey: string) => Promise<void>;
    /** All bookmarked question IDs */
    bookmarkedQuestionIds: string[];
    /** Total bookmark count */
    bookmarkCount: number;
    /** Loading state */
    loading: boolean;
    /** Whether the user is logged in */
    canBookmark: boolean;
    /** Check if operation is pending for a coordinate */
    isPending: (questionId: string, questionPubkey: string) => boolean;
    /** Whether bookmark list has been initialized */
    initialized: boolean;
}

/**
 * Hook for managing user's bookmark list (NIP-51 kind 10003)
 *
 * Features:
 * - Subscribes to user's kind 10003 event
 * - Optimistic updates with rollback on failure
 * - Debounced publishing to handle rapid toggles
 * - Works with NIP-51 replaceable event semantics
 */
const useBookmarks = (): UseBookmarksReturn => {
    const { publishEvent } = useContext(NDKContext) as NDKContext;
    const dispatch = useDispatch<AppDispatch>();

    // Auth state
    const auth = useSelector((state: RootState) => state.auth);
    const isLoggedIn = auth.isLoggedIn;
    const userPubkey = auth.pubkey;

    // Bookmark state
    const bookmarkState = useSelector((state: RootState) => state.bookmark);
    const bookmarkedCoordinates = bookmarkState.list?.bookmarkedCoordinates ?? [];

    // Debounce timer ref for rapid toggle handling
    const publishTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const pendingPublishRef = useRef<string[] | null>(null);

    // Subscribe to user's bookmark list (only when logged in)
    const filters = useMemo<NDKFilter | null>(() => {
        if (!isLoggedIn || !userPubkey) return null;
        return {
            kinds: [constants.bookmarkListKind as number],
            authors: [userPubkey]
        };
    }, [isLoggedIn, userPubkey]);

    const handleBookmarkEvent = useCallback((event: NDKEvent) => {
        const list = bookmarkListTransformer(event);
        dispatch(setBookmarkList(list));
    }, [dispatch]);

    const handleEose = useCallback(() => {
        // Mark as initialized even if no bookmarks exist
        dispatch(setBookmarkInitialized());
    }, [dispatch]);

    // Subscribe when user is logged in
    useNDKSubscription(
        filters ?? { kinds: [] },
        handleBookmarkEvent,
        handleEose,
        {
            ndkOptions: { closeOnEose: false },
            mode: EventHandlingMode.IMMEDIATE,
            resourceType: ResourceType.BOOKMARK,
            enabled: !!filters
        }
    );

    // Check if a question is bookmarked
    const isBookmarked = useCallback((questionId: string, questionPubkey: string): boolean => {
        const coord = buildQuestionCoordinate(questionPubkey, questionId);
        return bookmarkedCoordinates.includes(coord);
    }, [bookmarkedCoordinates]);

    // Check if operation is pending
    const isPending = useCallback((questionId: string, questionPubkey: string): boolean => {
        const coord = buildQuestionCoordinate(questionPubkey, questionId);
        return coord in bookmarkState.pendingOperations;
    }, [bookmarkState.pendingOperations]);

    // Publish updated bookmark list
    const publishBookmarkList = useCallback(async (newCoordinates: string[]): Promise<void> => {
        if (!userPubkey) return;

        const tags = buildBookmarkTags(newCoordinates);
        await publishEvent(constants.bookmarkListKind, '', tags);
    }, [userPubkey, publishEvent]);

    // Add bookmark with optimistic update
    const addBookmark = useCallback(async (questionId: string, questionPubkey: string): Promise<void> => {
        if (!isLoggedIn || !userPubkey) {
            dispatch(showToast({ title: 'Sign in to bookmark', subtitle: 'You need to be signed in to save questions.', type: 'warning' }));
            return;
        }

        const coord = buildQuestionCoordinate(questionPubkey, questionId);

        // Already bookmarked
        if (bookmarkedCoordinates.includes(coord)) return;

        // Optimistic update
        dispatch(addBookmarkOptimistic(coord));

        // Cancel any pending publish and schedule new one
        if (publishTimeoutRef.current) {
            clearTimeout(publishTimeoutRef.current);
        }

        // Build new coordinate array
        const newCoordinates = [...bookmarkedCoordinates, coord];
        pendingPublishRef.current = newCoordinates;

        // Debounce publish by 300ms to handle rapid toggles
        publishTimeoutRef.current = setTimeout(async () => {
            try {
                await publishBookmarkList(pendingPublishRef.current!);
                dispatch(showToast({ title: 'Bookmark saved', type: 'success' }));
            } catch {
                dispatch(revertBookmarkOperation({ coordinate: coord, operation: 'add' }));
                dispatch(showToast({ title: 'Failed to save bookmark', subtitle: 'Please try again.', type: 'error' }));
            }
        }, 300);
    }, [isLoggedIn, userPubkey, bookmarkedCoordinates, dispatch, publishBookmarkList]);

    // Remove bookmark with optimistic update
    const removeBookmark = useCallback(async (questionId: string, questionPubkey: string): Promise<void> => {
        if (!isLoggedIn || !userPubkey) return;

        const coord = buildQuestionCoordinate(questionPubkey, questionId);

        // Not bookmarked
        if (!bookmarkedCoordinates.includes(coord)) return;

        // Optimistic update
        dispatch(removeBookmarkOptimistic(coord));

        // Cancel any pending publish and schedule new one
        if (publishTimeoutRef.current) {
            clearTimeout(publishTimeoutRef.current);
        }

        // Build new coordinate array without the removed bookmark
        const newCoordinates = bookmarkedCoordinates.filter(c => c !== coord);
        pendingPublishRef.current = newCoordinates;

        // Debounce publish
        publishTimeoutRef.current = setTimeout(async () => {
            try {
                await publishBookmarkList(pendingPublishRef.current!);
                dispatch(showToast({ title: 'Bookmark removed', type: 'success' }));
            } catch {
                dispatch(revertBookmarkOperation({ coordinate: coord, operation: 'remove' }));
                dispatch(showToast({ title: 'Failed to remove bookmark', subtitle: 'Please try again.', type: 'error' }));
            }
        }, 300);
    }, [isLoggedIn, userPubkey, bookmarkedCoordinates, dispatch, publishBookmarkList]);

    // Toggle bookmark
    const toggleBookmark = useCallback(async (questionId: string, questionPubkey: string): Promise<void> => {
        if (isBookmarked(questionId, questionPubkey)) {
            await removeBookmark(questionId, questionPubkey);
        } else {
            await addBookmark(questionId, questionPubkey);
        }
    }, [isBookmarked, addBookmark, removeBookmark]);

    // Extract question IDs from coordinates
    const bookmarkedQuestionIds = useMemo(() => {
        return bookmarkedCoordinates
            .map(coord => {
                const parts = coord.split(':');
                return parts[2]; // Extract identifier (question ID)
            })
            .filter(Boolean);
    }, [bookmarkedCoordinates]);

    return {
        isBookmarked,
        toggleBookmark,
        addBookmark,
        removeBookmark,
        bookmarkedQuestionIds,
        bookmarkCount: bookmarkedCoordinates.length,
        loading: bookmarkState.loading,
        canBookmark: isLoggedIn,
        isPending,
        initialized: bookmarkState.initialized
    };
};

export default useBookmarks;
