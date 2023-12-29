import {useContext, useEffect, useState} from "react";
import {NDKContext} from "../../../components/NDKProvider";
import {NDKKind} from "@nostr-dev-kit/ndk";
import Question, {transformer as questionTransformer} from "../../../resources/question";
import {Navigate, useParams} from "react-router-dom";
import {validate as validateUUID} from 'uuid'
import {formatDateTime} from "../../../utils";
import MDEditor from '@uiw/react-md-editor';
import Loader from "../../../components/Loader";
import EventOwner from "../../../components/shared/EventOwner";
import AnswersContainer from "../../../components/answers/AnswersContainer";
import Votes from "../../../components/shared/Votes.tsx";

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
                    const questionFromEvent = questionTransformer(questionEvent!)
                    setQuestion(questionFromEvent)

                    console.log({questionEvent})
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
                <Votes kind={1993 as NDKKind} eventId={question.eventId} pubkey={question.user.pubkey}/>
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

            <AnswersContainer question={question}/>
        </div>
    )
}

export default Page
