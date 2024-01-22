import {NDKEvent} from "@nostr-dev-kit/ndk";
import {transformer as questionTransformer} from "../../resources/question";
import Loader from "../../components/Loader";
import QuestionsList from "../../components/questions/QuestionsList";
import constants from "../../constants";
import NoQuestion from '../../assets/no-questions.svg'
import useNDKSubscription from "../../hooks/useNDKSubscription.ts";
import {addQuestion, updateLastFetched} from "../../features/question/question-slice.ts";
import {useDispatch, useSelector} from "react-redux";
import {AppDispatch, RootState} from "../../store";

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
        return (
            <div className="mx-auto max-w-3xl">
                <div>
                    <img src={NoQuestion} alt={'placeholder'} className="h-72 w-72 mx-auto"/>
                    <h1 className="text-2xl text-slate-600 font-extrabold w-full text-center">
                        Got a question? Ask Away!
                    </h1>
                    <p className="text-lg w-full text-center font-semibold max-w-xl mx-auto text-slate-400">
                        The Apollo community is here to help. Your curiosity fuels our collaborative spirit
                    </p>
                </div>
            </div>
        )
    }

    return (
        <div className="mx-auto max-w-3xl">
            <QuestionsList questions={[...Object.values(questions.data)]}/>
        </div>
    )
}

export default Page;
