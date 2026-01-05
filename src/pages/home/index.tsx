import {NDKEvent} from "@nostr-dev-kit/ndk";
import {questionTransformer} from "../../domains/question/services/question.transformer";
import Loader from "../../shared/components/feedback/Loader";
import QuestionsList from "../../domains/question/components/QuestionsList";
import constants from "../../constants";
import useNDKSubscription from "../../shared/hooks/useNDKSubscription";
import {addQuestion, updateLastFetched} from "../../domains/question/store/question.slice";
import {useDispatch, useSelector} from "react-redux";
import {AppDispatch, RootState} from "../../app/store";
import EmptyState from "../../domains/question/components/EmptyState";

const Page = () => {
    const dispatch = useDispatch<AppDispatch>()
    const questions = useSelector((state: RootState) => state.question)

    const handleQuestionEvent = (event: NDKEvent) => {
        const questionFromEvent = questionTransformer(event)
        dispatch(addQuestion(questionFromEvent))
    }

    useNDKSubscription({kinds: [constants.questionKind]}, {closeOnEose: false}, handleQuestionEvent, () => dispatch(updateLastFetched()))

    if (questions.lastFetched === 0) {
        return <Loader/>
    }

    if (Object.entries(questions.data).length === 0) {
        return <EmptyState/>
    }

    return (
        <div className="mx-auto max-w-3xl">
            <QuestionsList questions={[...Object.values(questions.data)]}/>
        </div>
    )
}

export default Page;
