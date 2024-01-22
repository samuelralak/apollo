import {NDKEvent} from "@nostr-dev-kit/ndk";
import {transformer as questionTransformer} from "../../resources/question";
import Loader from "../../components/Loader";
import QuestionsList from "../../components/questions/QuestionsList";
import constants from "../../constants";
import useNDKSubscription from "../../hooks/useNDKSubscription.ts";
import {addQuestion, updateLastFetched} from "../../features/question/question-slice.ts";
import {useDispatch, useSelector} from "react-redux";
import {AppDispatch, RootState} from "../../store";
import EmptyState from "../../components/questions/EmptyState.tsx";

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
