import {z} from "zod";

const userProfileSchema =  z.object({
    name: z.string().min(1, "username is required"),
    firstName: z.string().min(1, "first name is required"),
    lastName: z.string().min(1, "last name is required"),
    about: z.string(),
    nip05: z.string(),
    lud16: z.string(),
    website: z.string()
})

export type UserProfileSchemaType = z.infer<typeof userProfileSchema>
export default userProfileSchema
