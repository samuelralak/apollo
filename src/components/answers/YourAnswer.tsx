import MDEditor from '@uiw/react-md-editor';
import {commandsFilter} from "../../utils/md-editor.ts";
import {FieldValues, SubmitHandler, useForm} from "react-hook-form";
import {zodResolver} from "@hookform/resolvers/zod";
import answerSchema from "../../schemas/answer-schema.ts";
import {ReactNode, useContext, useState} from "react";
import Question from "../../resources/question";
import {v4 as uuidv4} from "uuid";
import {NDKContext} from "../NDKProvider.tsx";
import {ToastContext} from "../ToastProvider.tsx";
import {useSelector} from "react-redux";
import {RootState} from "../../store";
import {ExclamationTriangleIcon} from "@heroicons/react/20/solid";
import constants from "../../constants";
import {Answer} from "../../resources/answer";
import AnswerItem from "./AnswerItem.tsx";

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
            <div className="rounded-lg bg-yellow-50 border-2 border-yellow-100 p-4 my-5">
                <div className="flex">
                    <div className="flex-shrink-0">
                        <ExclamationTriangleIcon className="h-5 w-5 text-yellow-400" aria-hidden="true"/>
                    </div>
                    <div className="ml-3 flex-1 md:flex md:justify-between">
                        <p className="text-sm text-yellow-700 font-medium">
                            You have to be logged in to share your wisdom and post an answer.
                        </p>
                        <p className="mt-3 text-sm md:ml-6 md:mt-0">
                            <a
                                onClick={() => window.document.getElementById('get-started')?.click()}
                                className="whitespace-nowrap font-semibold text-yellow-700 hover:text-yellow-600 cursor-pointer"
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
        return <AnswerItem answer={answer} editAction={onEditAction}/>
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
                            data-color-mode={'light'}
                            className="prose prose-slate max-w-none prose-code:text-slate-700"
                        />
                    </div>
                    {errors.description && (
                        <p className="mt-2 text-sm text-red-600 " id="email-error">
                            {errors.description.message as ReactNode}
                        </p>
                    )}
                </div>

                <div className="flex gap-x-6">
                    <button
                        type="submit"
                        disabled={publishing}
                        onClick={handleSubmit(onAnswerSubmit)}
                        className="rounded-lg bg-slate-600 px-3 py-3.5 text-sm font-semibold text-white disabled:bg-slate-400 disabled:text-slate-300 hover:bg-slate-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-600"
                    >
                        {publishing ? 'Publishing...' : 'Publish your answer'}
                    </button>

                    {editing && (
                        <button disabled={publishing}
                                onClick={onEditAction}
                                type="button"
                                className="text-sm font-semibold leading-6 text-slate-900 disabled:text-slate-300 text-center"
                        >
                            Cancel
                        </button>
                    )}
                </div>

            </div>


            <div className="rounded-lg bg-blue-50 p-4 border-2 border-blue-100 mt-5 text-slate-700">
                <div className="ml-3 flex flex-col gap-y-2">
                    <p className="text-sm">
                        Thanks for contributing an answer to our Q&A! Your insights are valuable.
                    </p>

                    <p className="text-sm font-semibold">When answering:</p>

                    <ul className="list-disc text-sm pl-8 flex flex-col gap-y-1">
                        <li>Ensure you address the question directly.</li>
                        <li>Include details, explanations, and if possible, references.</li>
                        <li>Embrace our diverse topics - from technical to personal experiences.</li>
                    </ul>

                    <p className="text-sm font-semibold">Avoid:</p>

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
