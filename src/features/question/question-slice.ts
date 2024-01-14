import {createSlice, PayloadAction} from "@reduxjs/toolkit";
import Question from "../../resources/question.ts";

interface QuestionState {
    data: Record<string, Question>
}

const initialState: QuestionState = {
    data: {}
}

const questionSlice = createSlice({
    name: 'question',
    initialState,
    reducers: {
        addQuestion: (state, {payload}: PayloadAction<Question>) => {
            state.data[payload.id] = payload
        }
    }
})

export const {addQuestion} = questionSlice.actions
export {type QuestionState}

export default questionSlice.reducer
