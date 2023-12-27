import MDEditor from '@uiw/react-md-editor';
import {commandsFilter} from "../../utils/md-editor.ts";
import {FieldValues, SubmitHandler, useForm} from "react-hook-form";
import {zodResolver} from "@hookform/resolvers/zod";
import answerSchema from "../../schemas/answer-schema.ts";
import {ReactNode, useContext} from "react";
import Question from "../../resources/question";
import {v4 as uuidv4} from "uuid";
import {NDKContext} from "../NDKProvider.tsx";
import {ToastContext} from "../ToastProvider.tsx";

const YourAnswer = ({question, publishing, setPublishing}: {
    question: Question,
    publishing: boolean,
    setPublishing: (value: boolean) => void
}) => {
    const answerId = uuidv4()
    const {showToast} = useContext(ToastContext) as ToastContext
    const {publishEvent} = useContext(NDKContext) as NDKContext
    const {handleSubmit, setValue, watch, formState: {errors}} = useForm({resolver: zodResolver(answerSchema)})
    const answerDescription = watch('description', '')

    const onEditorChange = (value?: string) => setValue('description', value)

    const onAnswerSubmit: SubmitHandler<FieldValues> = async ({description}) => {
        setPublishing(true)
        await publishEvent(2017, description, [
            ["d", answerId],
            ["e", question.eventId],
            ["a", `1993:${question.user.pubkey}:${question.id}`]
        ])

        setPublishing(false)
        setValue('description', '')
        showToast({
            title: 'Success',
            subtitle: 'Your answer has been successfully published.',
            type: 'success'
        })
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

                <button
                    type="submit"
                    disabled={publishing}
                    onClick={handleSubmit(onAnswerSubmit)}
                    className="rounded-lg bg-slate-600 px-3 py-3.5 text-sm font-semibold text-white disabled:bg-slate-400 disabled:text-slate-300 hover:bg-slate-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-600"
                >
                    {publishing ? 'Publishing...' : 'Publish your answer'}
                </button>
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
