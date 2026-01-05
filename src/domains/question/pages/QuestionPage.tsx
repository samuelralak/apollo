import {NDKEvent} from "@nostr-dev-kit/ndk";
import {questionTransformer} from "../services/question.transformer";
import {useParams} from "react-router";
import {formatDateTime, markdownToText} from "../../../utils";
import MDEditor from '@uiw/react-md-editor';
import Loader from "../../../shared/components/feedback/Loader";
import EventOwner from "../../user/components/EventOwner";
import AnswersContainer from "../../answer/components/AnswersContainer";
import Votes from "../../vote/components/Votes";
import useNDKSubscription from "../../../shared/hooks/useNDKSubscription";
import constants from "../../../constants";
import ActionItems from "../../../shared/components/ActionItems";
import SEOContainer from "../../../shared/components/SEOContainer";
import {useDispatch, useSelector} from "react-redux";
import {AppDispatch, RootState} from "../../../app/store";
import {addQuestion} from "../store/question.slice";
import CommentsList from "../../comment/components/CommentList";
import PostCommentBox from "../../comment/components/PostCommentBox";

const QuestionPage = () => {
    const dispatch = useDispatch<AppDispatch>()
    const {questionId} = useParams()
    const question = useSelector((state: RootState) => state.question).data[questionId!]

    const handleQuestionEvent = (event: NDKEvent) => {
        const questionFromEvent = questionTransformer(event)
        dispatch(addQuestion(questionFromEvent))
    }

    useNDKSubscription({
        kinds: [constants.questionKind],
        "#d": [questionId!]
    }, {closeOnEose: false}, handleQuestionEvent)

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

            <div className="mx-auto max-w-2xl">
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
                <div className="grid grid-cols-8 sm:grid-cols-12 gap-x-4 my-8">
                    <div className="col-span-1 sm:col-span-1 gap-y-3">
                        <Votes kind={constants.questionKind}
                               eventId={question.eventId}
                               pubkey={question.user.pubkey}
                               identifier={question.id}
                        />
                    </div>

                    <div className="col-span-7 sm:col-span-11">
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
                                className="bg-white prose prose-slate max-w-none"
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

                        <CommentsList resource={question} resourceKind={constants.questionKind} />
                        <PostCommentBox resource={question} resourceKind={constants.questionKind} />
                    </div>
                </div>

                <AnswersContainer question={question}/>
            </div>
        </>

    )
}

export default QuestionPage
