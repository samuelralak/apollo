import {useParams} from "react-router-dom";
import {transformer as questionTransformer} from "../../../../resources/question.ts";
import {NDKEvent} from "@nostr-dev-kit/ndk";
import useNDKSubscription from "../../../../hooks/useNDKSubscription.ts";
import QuestionForm from "../../../../components/questions/QuestionForm.tsx";
import constants from "../../../../constants";
import {useDispatch, useSelector} from "react-redux";
import {AppDispatch, RootState} from "../../../../store";
import {addQuestion} from "../../../../features/question/question-slice.ts";

const Page = () => {
    const dispatch = useDispatch<AppDispatch>()
    const {questionId} = useParams()
    const question = useSelector((state: RootState) => state.question).data[questionId!]

    const handleQuestionEvent = (event: NDKEvent) => {
        const questionFromEvent = questionTransformer(event)

        if (event.id !== question.eventId) {
            dispatch(addQuestion(questionFromEvent))
        }
    }

    useNDKSubscription({kinds: [constants.questionKind], "#d": [questionId!]}, {}, handleQuestionEvent)

    return (
        <div className="mx-auto max-w-7xl">
            <div className="md:flex md:items-center md:justify-between">
                <div className="min-w-0 flex-1">
                    <h2 className="text-2xl font-bold leading-7 text-slate-900 sm:truncate sm:text-3xl sm:tracking-tight">
                        Edit your question
                    </h2>
                </div>
            </div>

            {question && (<QuestionForm question={question}/>)}
        </div>
    )
}

export default Page
