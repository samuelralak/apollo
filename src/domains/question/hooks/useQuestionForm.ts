import {useContext, useState} from "react";
import {SubmitHandler, useForm} from "react-hook-form";
import {zodResolver} from "@hookform/resolvers/zod";
import {useNavigate} from "react-router";
import {v4 as uuidv4} from "uuid";
import questionSchema from "../schemas/question.schema";
import {NDKContext} from "../../../lib/ndk/NDKProvider";
import {ToastContext} from "../../../shared/components/feedback/ToastProvider";
import constants from "../../../constants";
import type {Question} from "../types/question.types";

export interface QuestionFormValues {
    title: string;
    description: string;
    category: string;
    tags: string[];
}

const useQuestionForm = (question?: Question) => {
    const navigate = useNavigate()
    const questionId = question?.id ?? uuidv4()

    const {showToast} = useContext(ToastContext) as ToastContext
    const {publishEvent} = useContext(NDKContext) as NDKContext
    const [publishing, setPublishing] = useState<boolean>(false)

    const form = useForm<QuestionFormValues>({
        resolver: zodResolver(questionSchema),
        defaultValues: {
            description: question?.description ?? '',
            tags: question?.tags ?? [],
            category: question?.category ?? '',
            title: question?.title ?? ''
        }
    })

    const onSubmit: SubmitHandler<QuestionFormValues> = async (data) => {
        setPublishing(true)

        try {
            const payload = {...data, id: questionId} as Question
            await publishEvent(constants.questionKind, payload.description, [
                ["d", payload.id!],
                ["title", payload.title],
                ["L", "category"],
                ["l", payload.category, "category"],
                ...payload.tags.map((tag) => ["t", tag])
            ])

            setPublishing(false)
            showToast({
                title: 'Success',
                subtitle: 'Your question has been successfully published.',
                type: 'success'
            })
            navigate(`/questions/${questionId}`)
        } catch {
            setPublishing(false)
        }
    }

    return {form, onSubmit, publishing}
}

export default useQuestionForm
