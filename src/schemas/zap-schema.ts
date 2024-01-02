import {z} from "zod";

export default z.object({
    amount: z
        .coerce
        .number()
        .positive()
        .min(21)
        .safe(),
    comment: z
        .string()
        .trim()
})
