import {z} from "zod";

const answerSchema = z.object({
    description: z
        .string()
        .min(1, "Answer is required")
        .max(1440, "Answer must be at most 720 characters long")
})

export type AnswerFormData = z.infer<typeof answerSchema>;
export default answerSchema;
