import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import type { BookmarkList, BookmarkState, BookmarkOperationPayload } from "../types/bookmark.types";

const initialState: BookmarkState = {
    list: null,
    loading: false,
    pendingOperations: {},
    initialized: false
};

const bookmarkSlice = createSlice({
    name: 'bookmark',
    initialState,
    reducers: {
        /**
         * Set the full bookmark list from a kind 10003 event
         * Replaces any existing list (NIP-51 replaceable event semantics)
         */
        setBookmarkList: (state, { payload }: PayloadAction<BookmarkList>) => {
            // Only update if this event is newer than current
            if (!state.list || payload.createdAt >= state.list.createdAt) {
                state.list = payload;
                state.pendingOperations = {}; // Clear pending on confirmed update
            }
            state.initialized = true;
            state.loading = false;
        },

        /**
         * Optimistically add a bookmark (before publish confirms)
         */
        addBookmarkOptimistic: (state, { payload }: PayloadAction<string>) => {
            if (state.list) {
                if (!state.list.bookmarkedCoordinates.includes(payload)) {
                    state.list.bookmarkedCoordinates.push(payload);
                }
            } else {
                // First bookmark - create new list
                state.list = {
                    eventId: '',
                    pubkey: '',
                    createdAt: Math.floor(Date.now() / 1000),
                    bookmarkedCoordinates: [payload]
                };
            }
            state.pendingOperations[payload] = 'add';
        },

        /**
         * Optimistically remove a bookmark (before publish confirms)
         */
        removeBookmarkOptimistic: (state, { payload }: PayloadAction<string>) => {
            if (state.list) {
                state.list.bookmarkedCoordinates = state.list.bookmarkedCoordinates.filter(
                    coord => coord !== payload
                );
            }
            state.pendingOperations[payload] = 'remove';
        },

        /**
         * Revert an optimistic operation on publish failure
         */
        revertBookmarkOperation: (state, { payload }: PayloadAction<BookmarkOperationPayload>) => {
            const { coordinate, operation } = payload;
            if (state.list) {
                if (operation === 'add') {
                    // Revert add: remove the coordinate
                    state.list.bookmarkedCoordinates = state.list.bookmarkedCoordinates.filter(
                        coord => coord !== coordinate
                    );
                } else {
                    // Revert remove: add the coordinate back
                    if (!state.list.bookmarkedCoordinates.includes(coordinate)) {
                        state.list.bookmarkedCoordinates.push(coordinate);
                    }
                }
            }
            delete state.pendingOperations[coordinate];
        },

        /**
         * Clear pending operation after confirmation
         */
        confirmBookmarkOperation: (state, { payload }: PayloadAction<string>) => {
            delete state.pendingOperations[payload];
        },

        /**
         * Set loading state
         */
        setBookmarkLoading: (state, { payload }: PayloadAction<boolean>) => {
            state.loading = payload;
        },

        /**
         * Mark as initialized (even if no bookmarks exist)
         */
        setBookmarkInitialized: (state) => {
            state.initialized = true;
            state.loading = false;
        },

        /**
         * Clear bookmarks on logout
         */
        clearBookmarks: () => initialState
    }
});

export const {
    setBookmarkList,
    addBookmarkOptimistic,
    removeBookmarkOptimistic,
    revertBookmarkOperation,
    confirmBookmarkOperation,
    setBookmarkLoading,
    setBookmarkInitialized,
    clearBookmarks
} = bookmarkSlice.actions;

export type { BookmarkState };
export default bookmarkSlice.reducer;
