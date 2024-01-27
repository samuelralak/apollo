import createResourceSlice from "../resource/resource-slice.ts";
import Comment from "../../resources/comment.ts";

const commentSlice = createResourceSlice<Comment>('comment')
export const {addItem: addComment} = commentSlice.actions
export default commentSlice.reducer
