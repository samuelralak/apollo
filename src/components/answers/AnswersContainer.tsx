import {Question} from "../../resources/question.ts";
import AnswerList from "./AnswerList.tsx";
import YourAnswer from "./YourAnswer.tsx";
import {useContext, useEffect, useState} from "react";
import {NDKEvent, NDKKind} from "@nostr-dev-kit/ndk";
import {NDKContext} from "../NDKProvider.tsx";
import {Answer} from "../../resources/answer.ts";

const answersFromEvent = (events: NDKEvent[]): Answer[] => {
    return events.reduce((acc, curr) => {
        return [...acc, ...[{
            id: curr.tags.filter((tag) => tag[0] === 'd')[0][1],
            questionId: (curr.tags.filter((tag) => tag[0] === 'a')[0][1]).split(":")[2],
            description: curr.content,
            createdAt: curr.created_at,
            eventId: curr.id,
            user: {
                pubkey: curr.pubkey
            }
        } as Answer]]
    }, [] as Answer[])
}

const AnswersContainer = ({question}: { question: Question }) => {
    const [answers, setAnswers] = useState<Answer[]>([])
    const [publishingAnswer, setPublishingAnswer] = useState<boolean>(false)
    const {ndkInstance} = useContext(NDKContext) as NDKContext

    useEffect(() => {
        (async () => {
            if (!publishingAnswer) {
                const filters = {kinds: [2017 as NDKKind], "#e": [question.eventId]}
                const answerEvents = await ndkInstance().fetchEvents(filters)
                setAnswers(answersFromEvent([...answerEvents]))
            }
        })()
    }, [question.eventId, publishingAnswer]);

    return (
        <>
            <AnswerList answers={answers}/>
            <div className="pt-5">
                <h1 className="text-xl font-medium text-slate-600">Your Answer</h1>
                <YourAnswer question={question} publishing={publishingAnswer} setPublishing={setPublishingAnswer}/>
            </div>
        </>
    )
}

export default AnswersContainer
