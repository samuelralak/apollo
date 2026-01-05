import {z} from "zod";

const commentSchema = z.object({
    comment: z
        .string()
        .min(15, "must be at least 15 characters")
        .max(144, "must be at most 144 characters")
})

export type CommentFormData = z.infer<typeof commentSchema>;
export default commentSchema;
