import type {Question} from "../../question/types/question.types";
import YourAnswer from "./YourAnswer";
import {useState, useCallback, useMemo} from "react";
import type {NDKFilter, NDKEvent} from "@nostr-dev-kit/ndk";
import {answerTransformer} from "../services/answer.transformer";
import constants from "../../../constants";
import useNDKSubscription, {ResourceType} from "../../../shared/hooks/useNDKSubscription";
import {useDispatch, useSelector} from "react-redux";
import {AppDispatch, RootState} from "../../../app/store";
import {updateAnswer} from "../store/answer.slice";
import AnswerItem from "./AnswerItem";

const AnswersContainer = ({question}: { question: Question }) => {
    const answerFilters: NDKFilter = useMemo(() => ({
        kinds: [constants.answerKind],
        "#a": [`${constants.questionKind}:${question.user.pubkey}:${question.id}`]
    }), [question.user.pubkey, question.id]);

    const pubkey = useSelector((state: RootState) => state.auth).pubkey;
    const questionAnswers = useSelector((state: RootState) => state.answer)[question.id];
    const [publishingAnswer, setPublishingAnswer] = useState<boolean>(false)
    const dispatch = useDispatch() as AppDispatch
    const answers = Object.values(questionAnswers?.data ?? {})
    const myAnswer = questionAnswers?.data[pubkey ?? '']
    const otherAnswers = answers.filter(a => a.user.pubkey !== pubkey)

    const handleAnswerEvent = useCallback((event: NDKEvent) => {
        const answer = answerTransformer(event)
        dispatch(updateAnswer(answer))
    }, [dispatch]);

    useNDKSubscription(
        answerFilters,
        handleAnswerEvent,
        undefined,
        {
            ndkOptions: { closeOnEose: false },
            resourceType: ResourceType.ANSWER,
            context: { parentId: question.id }
        }
    );

    return (
        <div className="mt-6 sm:mt-8 pt-4 sm:pt-6 border-t border-slate-200 dark:border-slate-700">
            {/* Answers header */}
            <h2 className="text-base sm:text-lg font-semibold text-slate-900 dark:text-slate-100 mb-3 sm:mb-4">
                {answers.length} {answers.length === 1 ? 'Answer' : 'Answers'}
            </h2>

            {/* Answers list */}
            {answers.length === 0 ? (
                <p className="text-sm text-slate-500 dark:text-slate-400 py-3 sm:py-4">
                    No answers yet. Be the first to answer!
                </p>
            ) : (
                <div className="divide-y divide-slate-200 dark:divide-slate-700">
                    {otherAnswers.map((answer) => (
                        <AnswerItem key={answer.id} question={question} answer={answer} />
                    ))}
                </div>
            )}

            {/* Your Answer section */}
            <div className="mt-6 sm:mt-8 pt-4 sm:pt-6 border-t border-slate-200 dark:border-slate-700">
                <h2 className="text-base sm:text-lg font-semibold text-slate-900 dark:text-slate-100">
                    Your Answer
                </h2>
                <YourAnswer
                    answer={myAnswer}
                    question={question}
                    publishing={publishingAnswer}
                    setPublishing={setPublishingAnswer}
                />
            </div>
        </div>
    )
}

export default AnswersContainer
