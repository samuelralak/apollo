import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import type { FollowList, FollowState, FollowOperationPayload } from "../types/follow.types";

const initialState: FollowState = {
    list: null,
    loading: false,
    pendingOperations: {},
    initialized: false
};

const followSlice = createSlice({
    name: 'follow',
    initialState,
    reducers: {
        /**
         * Set the follow list from a kind 3 event
         * Only accepts if newer than current (NIP-02 semantics)
         */
        setFollowList: (state, { payload }: PayloadAction<FollowList>) => {
            // Accept if no existing list or if newer timestamp
            if (!state.list || payload.createdAt >= state.list.createdAt) {
                state.list = payload;
                // Clear pending operations on confirmed update
                state.pendingOperations = {};
            }
            state.initialized = true;
            state.loading = false;
        },

        /**
         * Optimistically add a pubkey to the follow list
         */
        addFollowOptimistic: (state, { payload }: PayloadAction<string>) => {
            if (state.list) {
                // Only add if not already following
                if (!state.list.followedPubkeys.includes(payload)) {
                    state.list.followedPubkeys.push(payload);
                }
            } else {
                // First follow - create new list
                state.list = {
                    eventId: '',
                    pubkey: '',
                    createdAt: Math.floor(Date.now() / 1000),
                    followedPubkeys: [payload]
                };
            }
            state.pendingOperations[payload] = 'add';
        },

        /**
         * Optimistically remove a pubkey from the follow list
         */
        removeFollowOptimistic: (state, { payload }: PayloadAction<string>) => {
            if (state.list) {
                state.list.followedPubkeys = state.list.followedPubkeys.filter(
                    pubkey => pubkey !== payload
                );
            }
            state.pendingOperations[payload] = 'remove';
        },

        /**
         * Revert an optimistic operation on failure
         */
        revertFollowOperation: (state, { payload }: PayloadAction<FollowOperationPayload>) => {
            const { pubkey, operation } = payload;

            if (state.list) {
                if (operation === 'add') {
                    // Remove what we optimistically added
                    state.list.followedPubkeys = state.list.followedPubkeys.filter(
                        p => p !== pubkey
                    );
                } else {
                    // Add back what we optimistically removed
                    if (!state.list.followedPubkeys.includes(pubkey)) {
                        state.list.followedPubkeys.push(pubkey);
                    }
                }
            }

            delete state.pendingOperations[pubkey];
        },

        /**
         * Confirm a pending operation (clear from pending)
         */
        confirmFollowOperation: (state, { payload }: PayloadAction<string>) => {
            delete state.pendingOperations[payload];
        },

        /**
         * Mark initialization complete (EOSE received)
         */
        setFollowInitialized: (state) => {
            state.initialized = true;
            state.loading = false;
        },

        /**
         * Set loading state
         */
        setFollowLoading: (state, { payload }: PayloadAction<boolean>) => {
            state.loading = payload;
        },

        /**
         * Clear all follow state (on logout)
         */
        clearFollows: () => initialState
    }
});

export const {
    setFollowList,
    addFollowOptimistic,
    removeFollowOptimistic,
    revertFollowOperation,
    confirmFollowOperation,
    setFollowInitialized,
    setFollowLoading,
    clearFollows
} = followSlice.actions;

export default followSlice.reducer;
