import {z} from "zod";

const zapSchema = z.object({
    amount: z
        .number()
        .positive()
        .min(21)
        .safe(),
    comment: z
        .string()
        .trim()
})

export type ZapSchemaType = z.infer<typeof zapSchema>
export default zapSchema
