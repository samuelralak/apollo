import MDEditor from '@uiw/react-md-editor';
import {commandsFilter} from "../../../utils/md-editor";
import {FieldValues, SubmitHandler, useForm} from "react-hook-form";
import {zodResolver} from "@hookform/resolvers/zod";
import answerSchema from "../schemas/answer.schema";
import {ReactNode, useContext, useState} from "react";
import type {Question} from "../../question/types/question.types";
import {v4 as uuidv4} from "uuid";
import {NDKContext} from "../../../lib/ndk/NDKProvider";
import {ToastContext} from "../../../shared/components/feedback/ToastProvider";
import {useSelector} from "react-redux";
import {RootState} from "../../../app/store";
import {ExclamationTriangleIcon} from "@heroicons/react/20/solid";
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
    const auth = useSelector((state: RootState) => state.auth)
    const {showToast} = useContext(ToastContext) as ToastContext
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

        showToast({
            title: 'Success',
            subtitle: 'Your answer has been successfully published.',
            type: 'success'
        })
    }

    if (!auth?.isLoggedIn) {
        return (
            <div className="rounded-lg bg-yellow-50 dark:bg-yellow-900/30 border-2 border-yellow-100 dark:border-yellow-800 p-4 my-5">
                <div className="flex">
                    <div className="flex-shrink-0">
                        <ExclamationTriangleIcon className="h-5 w-5 text-yellow-500 dark:text-yellow-400" aria-hidden="true"/>
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
        <>
            <div>
                <div className="mb-5">
                    <div className="mt-5 w-full">
                        <MDEditor
                            value={answerDescription}
                            onChange={onEditorChange}
                            commandsFilter={commandsFilter}
                            preview={'edit'}
                            className="prose prose-slate dark:prose-invert max-w-none"
                        />
                    </div>
                    {errors.description && (
                        <p className="mt-2 text-sm text-red-500" id="email-error">
                            {errors.description.message as ReactNode}
                        </p>
                    )}
                </div>

                <div className="flex gap-x-6">
                    <button
                        type="submit"
                        disabled={publishing}
                        onClick={handleSubmit(onAnswerSubmit)}
                        className="rounded-lg bg-teal-600 dark:bg-teal-500 px-3 py-3.5 text-sm font-semibold text-white disabled:bg-slate-400 dark:disabled:bg-slate-600 disabled:text-slate-300 hover:bg-teal-700 dark:hover:bg-teal-400 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-600 transition-colors"
                    >
                        {publishing ? 'Publishing...' : 'Publish your answer'}
                    </button>

                    {editing && (
                        <button disabled={publishing}
                                onClick={onEditAction}
                                type="button"
                                className="text-sm font-semibold leading-6 text-slate-900 dark:text-slate-100 disabled:text-slate-300 dark:disabled:text-slate-600 text-center"
                        >
                            Cancel
                        </button>
                    )}
                </div>

            </div>


            <div className="rounded-lg bg-teal-50 dark:bg-teal-900/30 p-4 border-2 border-teal-100 dark:border-teal-800 mt-5 text-slate-700 dark:text-slate-300">
                <div className="ml-3 flex flex-col gap-y-2">
                    <p className="text-sm">
                        Thanks for contributing an answer to our Q&A! Your insights are valuable.
                    </p>

                    <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">When answering:</p>

                    <ul className="list-disc text-sm pl-8 flex flex-col gap-y-1">
                        <li>Ensure you address the question directly.</li>
                        <li>Include details, explanations, and if possible, references.</li>
                        <li>Embrace our diverse topics - from technical to personal experiences.</li>
                    </ul>

                    <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">Avoid:</p>

                    <ul className="list-disc text-sm pl-8 flex flex-col gap-y-1">
                        <li>Requesting clarification or additional information.</li>
                        <li>Baseless opinions. Prefer facts or shared experiences.</li>
                        <li>Responding to other answers unless providing additional information.</li>
                    </ul>
                </div>
            </div>
        </>
    )
}

export default YourAnswer
