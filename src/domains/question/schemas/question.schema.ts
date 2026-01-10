import {z} from "zod";

const questionSchema = z.object({
    title: z
        .string()
        .max(80, "Title must be at most 80 characters long")
        .min(1, "Title is required"),
    category: z
        .string()
        .min(1, "Category is required"),
    tags: z
        .array(z.string())
        .min(1, "At least one tag is required")
        .max(5, "At most 5 tags are allowed"),
    description: z
        .string()
        .min(50, "Description must be at least 50 characters long")
        .max(1440, "Description must be at most 1440 characters long")
})

export type QuestionFormData = z.infer<typeof questionSchema>;
export default questionSchema;
