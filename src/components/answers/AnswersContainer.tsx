import Question from "../../resources/question";
import AnswerList from "./AnswerList.tsx";
import YourAnswer from "./YourAnswer.tsx";
import {useState} from "react";
import {NDKFilter} from "@nostr-dev-kit/ndk";
import {transformer as answerTransformer} from "../../resources/answer";
import constants from "../../constants";
import useNDKSubscription from "../../hooks/useNDKSubscription.ts";
import {useDispatch, useSelector} from "react-redux";
import {AppDispatch, RootState} from "../../store";
import {updateAnswer} from "../../features/answer/answer-slice.ts";

const AnswersContainer = ({question}: { question: Question }) => {
    const answerFilters: NDKFilter = {kinds: [constants.answerKind], "#a": [`${constants.questionKind}:${question.user.pubkey}:${question.id}`]}
    const pubkey = useSelector((state: RootState) => state.auth).pubkey;
    const questionAnswers = useSelector((state: RootState) => state.answer)[question.id];
    const [publishingAnswer, setPublishingAnswer] = useState<boolean>(false)
    const dispatch = useDispatch() as AppDispatch
    const answers = Object.values(questionAnswers?.data ?? {})

    useNDKSubscription(answerFilters, {closeOnEose: false}, (event) => {
        const answer = answerTransformer(event)
        dispatch(updateAnswer(answer))
    })

    return (
        <>
            {answers.length >= 0 && !questionAnswers?.data[pubkey ?? ''] && (<AnswerList answers={answers}/>)}

            <div className="pt-5">
                <h1 className="text-lg font-bold text-slate-600">Your Answer</h1>
                <YourAnswer
                    answer={questionAnswers?.data[pubkey ?? '']}
                    question={question}
                    publishing={publishingAnswer}
                    setPublishing={setPublishingAnswer}
                />
            </div>
        </>
    )
}

export default AnswersContainer
