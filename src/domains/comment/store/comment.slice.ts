import createResourceSlice from "../../../features/resource/resource-slice";
import type { Comment } from "../types/comment.types";

const commentSlice = createResourceSlice<Comment>('comment')
export const {addItem: addComment} = commentSlice.actions
export default commentSlice.reducer
