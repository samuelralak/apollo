import Vote, {VoteType} from "../../resources/vote.ts";
import {createSlice, PayloadAction} from "@reduxjs/toolkit";

interface VoteData {
    data: {
        // key is user's pubkey
        [key: string]: Vote
    };
    total: number;
    downVotes: number;
    upVotes: number;
}

interface VoteState {
    // key is eventId of event being voted
    [key: string]: VoteData
}

const initialState: VoteState = {}

const calculateVotes = (votePayload: Vote, existingVote: VoteData, value: number) => {
    existingVote.downVotes += votePayload.vote === VoteType.DOWNVOTE ? value : 0;
    existingVote.upVotes += votePayload.vote === VoteType.UPVOTE ? value : 0;
    existingVote.data[votePayload.pubkey] = votePayload;
}

const voteSlice = createSlice({
    name: 'vote',
    initialState,
    reducers: {
        updateVote: (state, {payload}: PayloadAction<Vote>) => {
            const existingVote = state[payload.referenceEventId]
            if (!existingVote) {
                state[payload.referenceEventId] = {
                    total: 1,
                    downVotes: payload.vote === VoteType.DOWNVOTE ? 1 : 0,
                    upVotes: payload.vote === VoteType.UPVOTE ? 1 : 0,
                    data: {
                        [payload.pubkey]: payload
                    }
                }
            } else {
                const userVote = existingVote.data[payload.pubkey]
                if (!userVote) {
                    existingVote.total += 1;
                    calculateVotes(payload, existingVote, 1);
                    state[payload.referenceEventId] = existingVote
                } else {
                    if (userVote.vote !== payload.vote) {
                        calculateVotes(payload, existingVote, -1);
                        calculateVotes(payload, existingVote, 1);
                        existingVote.total = existingVote.upVotes + existingVote.downVotes
                        state[payload.referenceEventId] = existingVote
                    }
                }
            }
        }
    }
})

export const {updateVote} = voteSlice.actions
export {
    type VoteState
}

export default voteSlice.reducer
