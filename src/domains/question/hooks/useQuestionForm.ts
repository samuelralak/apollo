import { useContext, useState } from "react";
import { NDKUser } from "@nostr-dev-kit/ndk";
import { SubmitHandler, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate } from "react-router";
import { v4 as uuidv4 } from "uuid";
import questionSchema from "../schemas/question.schema";
import { NDKContext } from "../../../lib/ndk/NDKProvider";
import { useDispatch } from "react-redux";
import { AppDispatch } from "../../../app/store";
import { showToast } from "../../../shared/store/toast.slice";
import constants from "../../../constants";
import type { Question } from "../types/question.types";

export interface QuestionFormValues {
    title: string;
    description: string;
    category: string;
    tags: string[];
}

const useQuestionForm = (question?: Question) => {
    const navigate = useNavigate()
    const dispatch = useDispatch<AppDispatch>()
    const questionId = question?.id ?? uuidv4()

    const { publishEvent } = useContext(NDKContext) as NDKContext
    const [publishing, setPublishing] = useState<boolean>(false)

    const [invitedUsers, setInvitedUsers] = useState<NDKUser[]>([])

    const form = useForm<QuestionFormValues>({
        resolver: zodResolver(questionSchema),
        defaultValues: {
            description: question?.description ?? '',
            tags: question?.tags ?? [],
            category: question?.category ?? '',
            title: question?.title ?? ''
        }
    })

    const inviteUser = (user: NDKUser) => {
        if (!invitedUsers.find(u => u.pubkey === user.pubkey)) {
            setInvitedUsers([...invitedUsers, user])
        }
    }

    const removeInvitedUser = (pubkey: string) => {
        setInvitedUsers(invitedUsers.filter(u => u.pubkey !== pubkey))
    }

    const onSubmit: SubmitHandler<QuestionFormValues> = async (data) => {
        setPublishing(true)

        try {
            const payload = { ...data, id: questionId } as Question
            await publishEvent(constants.questionKind, payload.description, [
                ["d", payload.id!],
                ["title", payload.title],
                ["L", "category"],
                ["l", payload.category, "category"],
                ...payload.tags.map((tag) => ["t", tag]),
                ...invitedUsers.map((user) => ["p", user.pubkey, "", "mention"])
            ])

            setPublishing(false)
            dispatch(showToast({
                title: 'Success',
                subtitle: 'Your question has been successfully published.',
                type: 'success'
            }))
            navigate(`/questions/${questionId}`)
        } catch (error) {
            setPublishing(false)
            dispatch(showToast({
                title: 'Error',
                subtitle: error instanceof Error ? error.message : 'Failed to publish question. Please try again.',
                type: 'error'
            }))
        }
    }

    return { form, onSubmit, publishing, invitedUsers, inviteUser, removeInvitedUser }
}

export default useQuestionForm
