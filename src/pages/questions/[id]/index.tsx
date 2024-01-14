import {NDKEvent} from "@nostr-dev-kit/ndk";
import {transformer as questionTransformer} from "../../../resources/question";
import {useParams} from "react-router-dom";
import {formatDateTime, markdownToText} from "../../../utils";
import MDEditor from '@uiw/react-md-editor';
import Loader from "../../../components/Loader";
import EventOwner from "../../../components/shared/EventOwner";
import AnswersContainer from "../../../components/answers/AnswersContainer";
import Votes from "../../../components/shared/Votes.tsx";
import useNDKSubscription from "../../../hooks/useNDKSubscription.ts";
import constants from "../../../constants";
import ActionItems from "../../../components/shared/ActionItems.tsx";
import SEOContainer from "../../../components/SEOContainer.tsx";
import {useDispatch, useSelector} from "react-redux";
import {AppDispatch, RootState} from "../../../store";
import {addQuestion} from "../../../features/question/question-slice.ts";

const Page = () => {
    const dispatch = useDispatch<AppDispatch>()
    const {questionId} = useParams()
    const question = useSelector((state: RootState) => state.question).data[questionId!]

    const handleQuestionEvent = (event: NDKEvent) => {
        const questionFromEvent = questionTransformer(event)
        dispatch(addQuestion(questionFromEvent))
    }

    useNDKSubscription({kinds: [constants.questionKind], "#d": [questionId!]}, {}, handleQuestionEvent)

    if (!question) {
        return <Loader loadingText={'Fetching question'}/>
    }

    return (
        <>
            <SEOContainer
                title={question?.title}
                description={markdownToText(question.description)}
                keywords={question?.tags?.join(',')}
                url={`/questions/${question?.id}`}
            />

            <div className="mx-auto max-w-3xl">
                <h1 className="text-2xl font-extrabold text-slate-700">{question?.title}</h1>
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
                    <div className="flex flex-col gap-y-3">
                        <Votes kind={constants.questionKind} eventId={question.eventId} pubkey={question.user.pubkey}/>
                    </div>

                    <div className="flex-1">
                        <div className="question-detail">
                            <MDEditor.Markdown
                                source={question?.description ?? ''}
                                style={{
                                    whiteSpace: 'pre-wrap',
                                    backgroundColor: 'white',
                                    color: '#334155',
                                    fontFamily: 'Public Sans, sans-serif'
                                }}
                                data-color-mode={'light'}
                                className="bg-white prose prose-slate"
                            />
                        </div>


                        <div className="flex flex-row py-3 align-middle justify-between mt-5 items-center">
                            <div>
                                <p className="text-xs font-semibold text-slate-500 pb-1">
                                <span
                                    className="font-bold text-slate-700">asked</span> {formatDateTime(question?.createdAt)}
                                </p>
                                <EventOwner pubkey={question.user?.pubkey}/>
                            </div>


                            <ActionItems id={question.id} eventId={question.eventId} pubkey={question.user.pubkey}/>
                        </div>
                    </div>
                </div>

                <AnswersContainer question={question}/>
            </div>
        </>

    )
}

export default Page
