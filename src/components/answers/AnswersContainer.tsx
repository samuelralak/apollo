import Question from "../../resources/question";
import YourAnswer from "./YourAnswer.tsx";
import {Fragment, useState} from "react";
import {NDKFilter} from "@nostr-dev-kit/ndk";
import {transformer as answerTransformer} from "../../resources/answer";
import constants from "../../constants";
import useNDKSubscription from "../../hooks/useNDKSubscription.ts";
import {useDispatch, useSelector} from "react-redux";
import {AppDispatch, RootState} from "../../store";
import {updateAnswer} from "../../features/answer/answer-slice.ts";
import AnswerItem from "./AnswerItem.tsx";

const AnswersContainer = ({question}: { question: Question }) => {
    const answerFilters: NDKFilter = {
        kinds: [constants.answerKind],
        "#a": [`${constants.questionKind}:${question.user.pubkey}:${question.id}`]
    }
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
            {answers.length >= 0 && !questionAnswers?.data[pubkey ?? ''] && (
                <div className="mb-5">
                    <h1 className="text-lg font-bold text-slate-600">{answers.length ?? 0} Answers</h1>

                    {answers.length === 0 ? (
                        <div className="bg-slate-50 rounded-lg w-full h-20 flex items-center justify-center mt-3">
                            <p className="font-semibold text-lg text-slate-400 text-center">
                                No answers? Your insights could be the missing piece!
                            </p>
                        </div>
                    ) : (
                        <div className="flex flex-col divide-y divide-slate-200 gap-y-4">
                            {answers.length > 0 && answers.map((answer) => (
                                <Fragment key={answer.id}>
                                    {answer.user.pubkey !== pubkey && (<AnswerItem question={question} answer={answer}/>)}
                                </Fragment>
                            ))}
                        </div>
                    )}
                </div>
            )}

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
