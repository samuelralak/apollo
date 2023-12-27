import SelectMenu from "../../../components/forms/SelectMenu.tsx";
import {FieldValues, SubmitHandler, useForm} from "react-hook-form";
import {zodResolver} from "@hookform/resolvers/zod";
import questionSchema from "../../../schemas/question-schema.ts";
import 'react-customize-token-input/dist/react-customize-token-input.css';
import {MinusSmallIcon, PlusSmallIcon, XMarkIcon} from "@heroicons/react/24/outline";
import {KeyboardEvent, ReactNode, useContext, useEffect, useState} from "react";
import {classNames} from "../../../utils";
import {Category} from "../../../resources/category";
import MDEditor from '@uiw/react-md-editor';
import {Disclosure} from "@headlessui/react";
import categories from "../../../data/categories.json"
import guidelineData from "../../../data/guidelines.json"
import {Guideline} from "../../../resources/guideline.ts";
import {NDKContext} from "../../../components/NDKProvider.tsx";
import {Question} from "../../../resources/question.ts";
import {v4 as uuidv4} from 'uuid'
import {NDKKind} from "@nostr-dev-kit/ndk";
import {useNavigate} from "react-router-dom";
import {ToastContext} from "../../../components/ToastProvider.tsx";
import {commandsFilter} from "../../../utils/md-editor.ts";

const options: Category[] = categories
const guidelines: Record<string, Guideline[]> = guidelineData

const placeholderTitleExamples: Record<string, string> = {
    conversational_and_exploratory: "What life lesson did you learn the hard way and how?",
    technical_and_precise: "What are best practices for optimizing Lightning Network node performance?",
    generalized: "How do diet and exercise contribute to overall mental health?"
}

const Page = () => {
    const navigate = useNavigate()
    const questionId = uuidv4()

    const {showToast} = useContext(ToastContext) as ToastContext
    const {publishEvent, ndkInstance} = useContext(NDKContext) as NDKContext
    const [publishing, setPublishing] = useState<boolean>(false)
    const [tokenInputFocus, setTokenInputFocus] = useState<boolean>(false)
    const {
        handleSubmit,
        register,
        setValue,
        watch,
        formState: {errors}
    } = useForm({resolver: zodResolver(questionSchema)})
    const questionDescription = watch('description', '')
    const questionTags = watch('tags', [])
    const questionCategory = watch('category')

    const onEditorValueChange = (value?: string) => setValue('description', value!)

    const onToggleFocus = () => setTokenInputFocus(!tokenInputFocus)

    const onTokenInputKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
        const currentTarget = event.currentTarget as HTMLInputElement
        const tagInputValue = currentTarget.value.trim()

        if ((event.key === ' ' || event.key === ',') && tagInputValue) {
            event.preventDefault();
            setValue('tags', [...questionTags, tagInputValue.toLowerCase()]);
            currentTarget.value = ''
        }
    }

    const onRemoveToken = (index: number) => {
        const updatedTags: string[] = [...questionTags]
        updatedTags.splice(index, 1)
        setValue('tags', updatedTags)
    }

    const onQuestionSubmit: SubmitHandler<FieldValues> = async (data) => {
        setPublishing(true)
        const payload = {...data, id: questionId} as Question
        await publishEvent(1993, payload.description, [
            ["d", payload.id!],
            ["title", payload.title],
            ["category", payload.category],
            ...payload.tags.map((tag) => ["t", tag])
        ])
    }

    useEffect(() => {
        (() => {
            const subscription = ndkInstance().subscribe({kinds: [1993 as NDKKind], "#d": [questionId]})
            subscription.on("event", (event) => {
                if (event.relay) {
                    setPublishing(false)
                    showToast({
                        title: 'Success',
                        subtitle: 'Your question has been successfully published.',
                        type: 'success'
                    })
                    navigate(`/questions/${questionId}`)
                }
            })

            return () => subscription.stop()
        })()
    }, [questionId])

    return (
        <>
            <div className="md:flex md:items-center md:justify-between">
                <div className="min-w-0 flex-1">
                    <h2 className="text-2xl font-bold leading-7 text-slate-900 sm:truncate sm:text-3xl sm:tracking-tight">
                        Ask a public question
                    </h2>
                </div>
            </div>

            <div
                className="mx-auto mt-8 grid max-w-3xl grid-cols-1 gap-6 lg:max-w-7xl lg:grid-flow-col-dense lg:grid-cols-3">
                <div className="space-y-6 lg:col-span-2 lg:col-start-1">
                    <div className="sm:col-span-4">
                        <label htmlFor="username" className="block font-medium leading-6 text-slate-900">
                            Category
                            <p className="mt-1 text-sm text-slate-500 font-normal">
                                Please choose the appropriate section for your question
                            </p>
                        </label>
                        <div className="mt-5 w-full">
                            <SelectMenu
                                options={options}
                                idKey={'slug'}
                                descriptionKey={'description'}
                                placeholder={'Select a category'}
                                onChangeCallback={(value) => {
                                    setValue('category', value)
                                }}
                            />
                        </div>
                        {errors.category && (
                            <p className="mt-2 text-sm text-red-600" id="email-error">
                                {errors.category.message as ReactNode}
                            </p>
                        )}
                    </div>

                    <div className="sm:col-span-4">
                        <label htmlFor="username" className="block font-medium leading-6 text-slate-900">
                            Question Title
                            <p className="mt-1 text-sm text-slate-500 font-normal">
                                Imagine you are asking a question to another person
                            </p>
                        </label>
                        <div className="mt-5 w-full">
                            <input
                                {...register('title')}
                                type="text"
                                placeholder={`e.g ${placeholderTitleExamples[questionCategory] ?? ''}`}
                                className="block w-full border-0 focus:border-0 rounded-lg py-4 px-2 text-sm text-slate-900 ring-2 outline-none ring-slate-200 bg-slate-100 focus:bg-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-200 leading-6 "
                            />
                        </div>
                        {errors.title && (
                            <p className="mt-2 text-sm text-red-600" id="email-error">
                                {errors.title.message as ReactNode}
                            </p>
                        )}
                    </div>

                    <div className="sm:col-span-4">
                        <label htmlFor="username" className="block font-medium leading-6 text-slate-900">
                            Details
                            <p className="mt-1 text-sm text-slate-500 font-normal">
                                Include all the information someone would need to answer your question
                            </p>
                        </label>
                        <div className="mt-5 w-full">
                            <MDEditor
                                value={questionDescription}
                                onChange={onEditorValueChange}
                                commandsFilter={commandsFilter}
                                preview={'edit'}
                                data-color-mode={'light'}
                                textareaProps={{
                                    style: {color: "black"}
                                }}
                                minHeight={200}
                                className="prose prose-slate max-w-none prose-code:text-slate-700"
                            />
                        </div>
                        {errors.description && (
                            <p className="mt-2 text-sm text-red-600 " id="email-error">
                                {errors.description.message as ReactNode}
                            </p>
                        )}
                    </div>

                    <div className="sm:col-span-4">
                        <label htmlFor="username" className="block font-medium leading-6 text-slate-900">
                            Tags
                            <p className="mt-1 text-sm text-slate-500 font-normal">
                                Add up to 5 tags to describe what your question is about:
                            </p>
                        </label>
                        <div className="mt-5 w-full">
                            <div
                                className={classNames(
                                    tokenInputFocus ? "" : 'bg-slate-100',
                                    "flex flex-wrap rounded-lg ring-2 ring-inset ring-slate-200 focus-within:ring-2 focus-within:ring-inset focus-within:ring-slate-200 w-full"
                                )}
                            >

                                {questionTags.map((tag: string, index: number) => (
                                    <span
                                        key={`${tag}-${index}`}
                                        className="flex select-none items-center gap-x-0.5 rounded-md bg-slate-800 px-2 py-1 text-xs font-medium text-slate-50 my-2 h-7 self-center ml-2"
                                    >
                                        {tag}
                                        <button type="button"
                                                onClick={() => onRemoveToken(index)}
                                                className="group relative -mr-1 h-3.5 w-3.5 rounded-sm hover:bg-slate-500/20"
                                        >
                                            <span className="sr-only">Remove</span>
                                            <XMarkIcon className="h-3.5 w-3.5"/>
                                            <span className="absolute -inset-1"/>
                                        </button>
                                    </span>
                                ))}

                                <input
                                    type="text"
                                    name="tags"
                                    className="block flex-1 border-0 bg-transparent py-4 text-sm pl-1 text-slate-900 placeholder:text-slate-400 focus:ring-0 focus:outline-none leading-6"
                                    placeholder="comma or space seperated values "
                                    onKeyDown={onTokenInputKeyDown}
                                    onFocus={onToggleFocus}
                                    onBlur={onToggleFocus}
                                />
                            </div>
                            {errors.tags && (
                                <p className="mt-2 text-sm text-red-600" id="email-error">
                                    {errors.tags.message as ReactNode}
                                </p>
                            )}
                        </div>
                    </div>

                    <div className="mt-6 flex items-center justify-end gap-x-6 border-t border-slate-900/10 pt-6">
                        <button disabled={publishing}
                                type="button"
                                className="text-sm font-semibold leading-6 text-slate-900 disabled:text-slate-300"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={publishing}
                            onClick={handleSubmit(onQuestionSubmit)}
                            className="rounded-lg bg-slate-600 px-3 py-3.5 text-sm font-semibold text-white disabled:bg-slate-400 disabled:text-slate-300 hover:bg-slate-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-600"
                        >
                            {publishing ? 'Publishing...' : 'Publish your question'}
                        </button>
                    </div>
                </div>

                <section className="lg:col-span-1 lg:col-start-3">
                    <div className="divide-y divide-slate-200 overflow-hidden rounded-lg bg-white shadow">
                        <div className="px-4 py-5 sm:px-6">
                            <h3 className="text-base font-semibold leading-6 text-slate-900">
                                Craft your question
                            </h3>
                        </div>
                        <div className="px-4 py-5 sm:p-6">
                            <p className="text text-slate-600">
                                Navigate through these simple steps to tailor your queries.
                            </p>

                            <dl className="space-y-6 divide-y divide-slate-900/10">
                                {guidelines[questionCategory] ? guidelines[questionCategory]?.map((guideline, index) => (
                                    <Disclosure as="div" key={`${guideline.summary}-${index}`} className="pt-6"
                                                defaultOpen={index === 0}>
                                        {({open}) => (
                                            <>
                                                <dt>
                                                    <Disclosure.Button
                                                        className="flex w-full items-start justify-between text-left text-slate-900">
                                                        <span
                                                            className="text-base font-semibold leading-7"
                                                        >
                                                            {index + 1}. {guideline.summary}
                                                        </span>
                                                        <span className="ml-6 flex h-7 items-center">
                                                        {open ? (
                                                            <MinusSmallIcon className="h-6 w-6" aria-hidden="true"/>
                                                        ) : (
                                                            <PlusSmallIcon className="h-6 w-6" aria-hidden="true"/>
                                                        )}
                                                    </span>
                                                    </Disclosure.Button>
                                                </dt>
                                                <Disclosure.Panel as="dd" className="mt-2 pl-5">
                                                    <ul className="list-disc">
                                                        {guideline.points.map((point, idx) => (
                                                            <li key={`${point}-${idx}`}
                                                                className="text-base leading-7 text-slate-600">
                                                                {point}
                                                            </li>
                                                        ))}
                                                    </ul>

                                                </Disclosure.Panel>
                                            </>
                                        )}
                                    </Disclosure>
                                )) : (
                                    <div
                                        className="w-full py-4 my-6 rounded-xl border-2 border-slate-200 border-dashed">
                                        <p className="text-center text-slate-600">
                                            Select a category for guidelines
                                        </p>
                                    </div>
                                )}
                            </dl>
                        </div>
                    </div>
                </section>
            </div>
        </>
    )
}

export default Page
