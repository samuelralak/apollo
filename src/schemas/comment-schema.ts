import {z} from "zod";

export default z.object({
    comment: z
        .string()
        .min(15, "must be at least 15 characters")
        .max(144, "must be at most 144 characters")
})
