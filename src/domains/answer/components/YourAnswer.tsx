import MDEditor from '@uiw/react-md-editor';
import {commandsFilter} from "../../../utils/md-editor";
import {FieldValues, SubmitHandler, useForm} from "react-hook-form";
import {zodResolver} from "@hookform/resolvers/zod";
import answerSchema from "../schemas/answer.schema";
import {ReactNode, useContext, useState} from "react";
import type {Question} from "../../question/types/question.types";
import {v4 as uuidv4} from "uuid";
import {NDKContext} from "../../../lib/ndk/NDKProvider";
import {useDispatch, useSelector} from "react-redux";
import {AppDispatch, RootState} from "../../../app/store";
import {showToast} from "../../../shared/store/toast.slice";
import {HugeiconsIcon} from "@hugeicons/react";
import {Alert02Icon} from "@hugeicons-pro/core-twotone-rounded";
import constants from "../../../constants";
import type {Answer} from "../types/answer.types";
import AnswerItem from "./AnswerItem";

const YourAnswer = ({answer, question, publishing, setPublishing}: {
    answer?: Answer
    question: Question,
    publishing: boolean,
    setPublishing: (value: boolean) => void
}) => {
    const answerId = answer?.id ?? uuidv4()
    const dispatch = useDispatch<AppDispatch>()
    const auth = useSelector((state: RootState) => state.auth)
    const {publishEvent} = useContext(NDKContext) as NDKContext
    const [editing, setEditing] = useState<boolean>(false)
    const {handleSubmit, setValue, watch, formState: {errors}} = useForm({
        resolver: zodResolver(answerSchema),
        defaultValues: {
            description: answer?.description ?? ''
        }
    })
    const answerDescription = watch('description', answer?.description ?? '')

    const onEditorChange = (value?: string) => {
        if (value) {
            setValue('description', value)
        }
    }

    const onEditAction = () => {
        setEditing(!editing)
    }

    const onAnswerSubmit: SubmitHandler<FieldValues> = async ({description}) => {
        setPublishing(true)
        await publishEvent(constants.answerKind, description, [
            ["d", answerId],
            ["e", question.eventId],
            ["a", `${constants.questionKind}:${question.user.pubkey}:${question.id}`]
        ])

        setPublishing(false)
        setEditing(editing ? !editing : editing)

        if (!editing) {
            setValue('description', '')
        }

        dispatch(showToast({
            title: 'Success',
            subtitle: 'Your answer has been successfully published.',
            type: 'success'
        }))
    }

    if (!auth?.isLoggedIn) {
        return (
            <div className="rounded-lg bg-yellow-50 dark:bg-yellow-900/30 border-2 border-yellow-100 dark:border-yellow-800 p-4 my-5">
                <div className="flex">
                    <div className="flex-shrink-0">
                        <HugeiconsIcon icon={Alert02Icon} className="text-yellow-500 dark:text-yellow-400" size={20} aria-hidden="true" />
                    </div>
                    <div className="ml-3 flex-1 md:flex md:justify-between">
                        <p className="text-sm text-yellow-700 dark:text-yellow-300 font-medium">
                            You have to be logged in to share your wisdom and post an answer.
                        </p>
                        <p className="mt-3 text-sm md:ml-6 md:mt-0">
                            <a
                                onClick={() => window.document.getElementById('get-started')?.click()}
                                className="whitespace-nowrap font-semibold text-yellow-700 dark:text-yellow-300 hover:text-yellow-600 dark:hover:text-yellow-200 cursor-pointer"
                            >
                                Get started
                                <span aria-hidden="true"> &rarr;</span>
                            </a>
                        </p>
                    </div>
                </div>
            </div>
        )
    }

    if (answer && !editing) {
        return <AnswerItem answer={answer} question={question} editAction={onEditAction}/>
    }

    return (
        <div className="mt-4">
            <div className="w-full">
                <MDEditor
                    value={answerDescription}
                    onChange={onEditorChange}
                    commandsFilter={commandsFilter}
                    preview={'edit'}
                    className="prose prose-slate dark:prose-invert max-w-none"
                />
            </div>
            {errors.description && (
                <p className="mt-2 text-sm text-red-500">
                    {errors.description.message as ReactNode}
                </p>
            )}

            <div className="flex items-center gap-4 mt-4">
                <button
                    type="submit"
                    disabled={publishing}
                    onClick={handleSubmit(onAnswerSubmit)}
                    className="rounded-md bg-teal-600 dark:bg-teal-500 px-4 py-2 text-sm font-semibold text-white disabled:bg-slate-400 dark:disabled:bg-slate-600 hover:bg-teal-700 dark:hover:bg-teal-400 transition-colors"
                >
                    {publishing ? 'Publishing...' : 'Post your answer'}
                </button>

                {editing && (
                    <button
                        disabled={publishing}
                        onClick={onEditAction}
                        type="button"
                        className="text-sm font-medium text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100"
                    >
                        Cancel
                    </button>
                )}
            </div>

            <p className="mt-4 text-xs text-slate-500 dark:text-slate-400">
                Be specific and include details. Avoid asking for clarification in answers.
            </p>
        </div>
    )
}

export default YourAnswer
