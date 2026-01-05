import type { Vote } from "../types/vote.types";
import { VoteType } from "../types/vote.types";
import {createSlice, PayloadAction} from "@reduxjs/toolkit";

interface VoteData {
    data: Record<string, Vote>;  // key is user's pubkey
    total: number;               // Net score: upVotes - downVotes
}

interface VoteState {
    [key: string]: VoteData      // key is resource identifier
}

const initialState: VoteState = {}

// Convert vote type to numeric value: upvote = +1, downvote = -1
const voteValue = (type: VoteType): number => type === VoteType.UPVOTE ? 1 : -1;

const voteSlice = createSlice({
    name: 'vote',
    initialState,
    reducers: {
        updateVote: (state, { payload }: PayloadAction<Vote>) => {
            const { resourceId, pubkey, vote } = payload;
            const newValue = voteValue(vote);

            // Initialize resource if first vote
            if (!state[resourceId]) {
                state[resourceId] = { data: {}, total: 0 };
            }

            const resource = state[resourceId];
            const oldVote = resource.data[pubkey];
            const oldValue = oldVote ? voteValue(oldVote.vote) : 0;

            // Apply delta: new - old (handles new votes, changes, and same votes)
            resource.total += newValue - oldValue;
            resource.data[pubkey] = payload;
        },
        revertVote: (state, { payload }: PayloadAction<{ resourceId: string; pubkey: string }>) => {
            const { resourceId, pubkey } = payload;
            const resource = state[resourceId];

            if (resource?.data[pubkey]) {
                const oldValue = voteValue(resource.data[pubkey].vote);
                resource.total -= oldValue;
                delete resource.data[pubkey];
            }
        }
    }
})

export const {updateVote, revertVote} = voteSlice.actions
export {
    type VoteState,
    type VoteData
}

export default voteSlice.reducer
