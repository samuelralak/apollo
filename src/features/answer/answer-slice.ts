import {Answer} from "../../resources/answer";
import {createSlice, PayloadAction} from "@reduxjs/toolkit";

interface AnswerData {
    data: {
        // key here is the answer's pubkey
        [key: string]: Answer
    },
    total: number;
}

interface AnswerState {
    // key is the reference event id, in this case - the question event id
    [key: string]: AnswerData
}

const initialState: AnswerState = {}

const answerSlice = createSlice({
    name: 'answer',
    initialState,
    reducers: {
        updateAnswer: (state, {payload}: PayloadAction<Answer>) => {
            if (state[payload.questionId]) {
                const answerData = state[payload.questionId].data[payload.user.pubkey]
                state[payload.questionId].data[payload.user.pubkey] = payload

                if (!answerData) {
                    state[payload.questionId].total += 1
                }
            } else {
                state[payload.questionId] = {
                    data: {
                        [payload.user.pubkey]: payload
                    },
                    total: 1
                };
            }
        }
    }
})

export const {updateAnswer} = answerSlice.actions
export {
    type AnswerState,
    type AnswerData
}

export default answerSlice.reducer
