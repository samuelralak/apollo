import {createSlice, PayloadAction} from "@reduxjs/toolkit";
import Question from "../../resources/question.ts";

interface QuestionState {
    data: Record<string, Question>;
    lastFetched: number;
}

const initialState: QuestionState = {
    data: {},
    lastFetched: 0,
}

const questionSlice = createSlice({
    name: 'question',
    initialState,
    reducers: {
        addQuestion: (state, {payload}: PayloadAction<Question>) => {
            state.data[payload.id] = payload
        },
        updateLastFetched: (state) => {
            state.lastFetched = Math.floor(Date.now() / 1000)
        }
    }
})

export const {addQuestion, updateLastFetched} = questionSlice.actions
export {type QuestionState}

export default questionSlice.reducer
