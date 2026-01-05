import {createSlice, PayloadAction} from "@reduxjs/toolkit";
import type { Comment } from "../types/comment.types";

interface CommentState {
    data: { [key: string]: Comment };
    total: number;
}

interface CommentsState {
    [parentId: string]: CommentState;
}

const createCommentState = (): CommentState => ({
    data: {},
    total: 0,
});

const commentSlice = createSlice({
    name: 'comment',
    initialState: {} as CommentsState,
    reducers: {
        addComment: (state, {payload: {key, item}}: PayloadAction<{ key: string, item: Comment }>) => {
            const parentKey = item?.parentId

            if (!parentKey) {
                return
            }

            if (!state[parentKey]) {
                state[parentKey] = createCommentState()
            }

            state[parentKey].data[key] = item
            state[parentKey].total = Object.keys(state[parentKey].data).length
        }
    }
})

export const {addComment} = commentSlice.actions
export default commentSlice.reducer
