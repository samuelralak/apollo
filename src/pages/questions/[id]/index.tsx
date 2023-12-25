import {PlayIcon} from "@heroicons/react/24/outline";
import {useContext, useEffect, useState} from "react";
import {NDKContext} from "../../../components/NDKProvider";
import {NDKEvent, NDKKind} from "@nostr-dev-kit/ndk";
import {Question} from "../../../resources/question.ts";
import {Navigate, useParams} from "react-router-dom";
import {validate as validateUUID} from 'uuid'
import {formatDateTime} from "../../../utils";
import MDEditor, {codeLive, divider, fullscreen, hr, ICommand, image, strikethrough, title} from '@uiw/react-md-editor';
import Loader from "../../../components/Loader.tsx";
import EventOwner from "../../../components/shared/EventOwner.tsx";

// TODO: Duplicated code
const excludeCommands = [
    codeLive.name, fullscreen.name, title.name, image.name, hr.name, strikethrough.name, divider.name
]

const commandsFilter = (command: ICommand): false | ICommand => {
    if (excludeCommands.includes(command.name) || !excludeCommands.includes(command.groupName)) {
        return false
    }

    return command
}

const marshallQuestionAttributes = (event: NDKEvent): Question => {
    let question = {
        description: event.content,
        createdAt: event.created_at,
        user: {pubkey: event.pubkey}
    } as Question

    question = event.tags.reduce((accumulator, currentValue) => {
        const [tag, value] = currentValue

        switch (tag) {
            case "category":
                accumulator.category = value
                break;
            case "title":
                accumulator.title = value
                break;
            case "d":
                accumulator.id = value
                break;
            case "t":
                accumulator.tags = [...(accumulator.tags ?? []), ...[value]]
                break;
            default:
            // Do nothing...
        }

        return accumulator
    }, question)

    return question
}

const Page = () => {
    const {questionId} = useParams()
    const [validQuestionId, setValidQuestionId] = useState<boolean>(true)
    const [question, setQuestion] = useState<Question>()
    const {ndkInstance} = useContext(NDKContext) as NDKContext

    // TODO: Move into a custom hook
    useEffect(() => {
        if (questionId) {
            const isValidUUID = validateUUID(questionId)

            if (isValidUUID) {
                (async () => {
                    const questionFilters = {kinds: [1993 as NDKKind], "#d": [questionId]}
                    const questionEvent = await ndkInstance().fetchEvent(questionFilters, {closeOnEose: false})
                    const questionFromEvent = marshallQuestionAttributes(questionEvent!)
                    setQuestion(questionFromEvent)
                })()
            } else {
                setValidQuestionId(isValidUUID)
            }

        }

    }, [questionId]);

    console.log({question})

    if (!questionId || !validQuestionId) {
        return <Navigate replace to='/'/>
    }

    if (!question) {
        return <Loader loadingText={'Fetching question'}/>
    }

    return (
        <div className="mx-auto max-w-3xl">
            <h1 className="text-2xl font-semibold text-slate-700">{question?.title}</h1>
            <div className="flex flex-row gap-x-2 mt-1">
                <p className="text-xs sm:text-sm font-medium text-slate-500">
                    Asked {formatDateTime(question?.createdAt)}
                </p>
            </div>

            <div className="flex flex-row gap-x-2 mt-3.5">
                {question?.tags?.map((tag, index) => (
                    <span
                        key={`${tag}-${index}-${question?.id}`}
                        className="inline-flex items-center rounded-md bg-slate-100 px-2 py-1 text-xs font-medium text-slate-600"
                    >
                        {tag}
                    </span>
                ))}
            </div>
            <div className="flex flex-row gap-x-4 my-8">
                <div className="w-10 flex flex-col items-center">
                    <PlayIcon className="h-6 -rotate-90 text-slate-400"/>
                    <p className="w-full text-center font-semibold text-xl text-slate-600">1</p>
                    <PlayIcon className="h-6 rotate-90 text-slate-400"/>
                </div>
                <div className="flex-1">
                    <div className="question-detail">
                        <MDEditor.Markdown
                            source={question?.description ?? ''}
                            style={{
                                whiteSpace: 'pre-wrap',
                                backgroundColor: 'white',
                                color: '#334155',
                                fontFamily: 'Poppins, sans-serif'
                            }}
                            data-color-mode={'light'}
                            className="bg-white font-normal text-slate-700 prose prose-slate max-w-3xl"
                        />
                    </div>


                    <div className="flex flex-row py-3 align-middle justify-between mt-5">
                        <div className="flex gap-x-2 text-sm font-medium text-slate-500">
                            <a className="hover:text-slate-700 cursor-pointer">Share</a>
                            <a className="hover:text-slate-700 cursor-pointer">Zap</a>
                            <a className="hover:text-slate-700 cursor-pointer">Edit</a>
                        </div>

                        {question.user?.pubkey && (
                            <EventOwner pubkey={question.user?.pubkey}/>
                        )}
                    </div>
                </div>
            </div>

            <div className="divide-y divide-slate-200">
                <div className="mb-5">
                    <h1 className="text-xl font-medium text-slate-600">3 Answers</h1>

                    <div className="flex flex-row gap-x-4 mt-8">
                        <div className="w-10 flex flex-col items-center">
                            <PlayIcon className="h-6 -rotate-90 text-slate-400"/>
                            <p className="w-full text-center font-semibold text-xl text-slate-600">1</p>
                            <PlayIcon className="h-6 rotate-90 text-slate-400"/>
                        </div>
                        <div className="flex-1">
                            <div className="question-detail">
                                <p>
                                    Vestibulum aliquam vitae eros nec sodales. Proin sed turpis eget ipsum porta tempus.
                                    Nullam felis nibh, suscipit in lectus eu, pharetra vehicula neque. Nulla eget magna
                                    consequat, porttitor leo sed, pretium lacus. Praesent nisi lectus, rhoncus sed
                                    dignissim
                                    eu, faucibus id ante. Donec sit amet magna venenatis, elementum est eu, condimentum
                                    velit. Sed maximus sem et nisi vulputate pulvinar. Quisque condimentum eros eget
                                    vulputate accumsan. Vestibulum aliquam, orci ac iaculis posuere, urna tellus
                                    malesuada
                                    augue, nec pellentesque lectus urna vel lectus.
                                </p>
                            </div>


                            <div className="flex flex-row py-3 align-middle justify-center">
                                <a href="#" className="group block flex-shrink-0 flex-1">
                                    <div className="flex items-center">
                                        <div>
                                            <img
                                                className="inline-block h-9 w-9 rounded-lg"
                                                src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80"
                                                alt=""
                                            />
                                        </div>
                                        <div className="ml-3">
                                            <p className="text-sm font-medium text-slate-700 group-hover:text-slate-900">Tom
                                                Cook</p>
                                            <p className="text-xs font-medium text-slate-500 group-hover:text-slate-700">View
                                                profile</p>
                                        </div>
                                    </div>
                                </a>
                                <div>
                                    <dl className="text-right text-sm">
                                        <dt>asked</dt>
                                        <dd>6 hours ago</dd>
                                    </dl>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="pt-5">
                    <h1 className="text-xl font-medium text-slate-600">Your Answer</h1>
                    <div className="mt-5 w-full">
                        <MDEditor
                            value={""}
                            onChange={() => {
                            }}
                            commandsFilter={commandsFilter}
                            preview={'edit'}
                            data-color-mode={'light'}
                            className="prose prose-slate max-w-none prose-code:text-slate-700"
                        />
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
                </div>

            </div>

        </div>
    )
}

export default Page
