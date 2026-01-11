import {useCallback, useMemo} from "react";
import type {NDKEvent} from "@nostr-dev-kit/ndk";
import {questionTransformer} from "../services/question.transformer";
import {useParams} from "react-router";
import {formatDateTime, markdownToText} from "../../../utils";
import MDEditor from '@uiw/react-md-editor';
import QuestionDetailSkeleton from "../components/QuestionDetailSkeleton";
import EventOwner from "../../user/components/EventOwner";
import AnswersContainer from "../../answer/components/AnswersContainer";
import Votes from "../../vote/components/Votes";
import useNDKSubscription, {ResourceType} from "../../../shared/hooks/useNDKSubscription";
import constants from "../../../constants";
import ActionItems from "../../../shared/components/ActionItems";
import SEOContainer from "../../../shared/components/SEOContainer";
import {useDispatch, useSelector} from "react-redux";
import {AppDispatch, RootState} from "../../../app/store";
import {addQuestion} from "../store/question.slice";
import CommentsList from "../../comment/components/CommentList";
import PostCommentBox from "../../comment/components/PostCommentBox";
import categories from "../../../data/categories.json";
import MentionedUsers from "../components/MentionedUsers";
import {BookmarkButton} from "../../bookmark/components";

const getCategoryTitle = (slug: string): string | undefined => {
    const category = categories.find(c => c.slug === slug);
    return category?.title;
};

const QuestionPage = () => {
    const dispatch = useDispatch<AppDispatch>()
    const {questionId} = useParams()
    const question = useSelector((state: RootState) => state.question).data[questionId!]
    const categoryTitle = question?.category ? getCategoryTitle(question.category) : undefined;

    const handleQuestionEvent = useCallback((event: NDKEvent) => {
        const questionFromEvent = questionTransformer(event)
        dispatch(addQuestion(questionFromEvent))
    }, [dispatch]);

    const filters = useMemo(() => ({
        kinds: [constants.questionKind],
        "#d": [questionId!]
    }), [questionId]);

    useNDKSubscription(
        filters,
        handleQuestionEvent,
        undefined,
        {
            ndkOptions: { closeOnEose: false },
            resourceType: ResourceType.QUESTION
        }
    );

    if (!question) {
        return <QuestionDetailSkeleton />
    }

    return (
        <>
            <SEOContainer
                title={question?.title}
                description={markdownToText(question.description)}
                keywords={question?.tags?.join(',')}
                url={`/questions/${question?.id}`}
            />

            <div className="max-w-3xl">
                {/* Header */}
                <header className="mb-4 sm:mb-6">
                    {categoryTitle && (
                        <span className="inline-flex items-center rounded-full bg-teal-50 dark:bg-teal-900/20 px-2.5 py-0.5 text-xs font-medium text-teal-700 dark:text-teal-300 ring-1 ring-inset ring-teal-600/20 dark:ring-teal-400/20 mb-2">
                            {categoryTitle}
                        </span>
                    )}
                    <h1 className="text-lg sm:text-xl font-semibold text-slate-900 dark:text-slate-100 leading-snug">
                        {question?.title}
                    </h1>
                    <div className="flex items-center gap-1.5 sm:gap-4 mt-2 text-xs text-slate-500 dark:text-slate-400">
                        <EventOwner pubkey={question.user?.pubkey} mini={true} inline={true} />
                        <span>·</span>
                        <span>{formatDateTime(question?.createdAt)}</span>
                    </div>
                    {question.mentionedPubkeys && question.mentionedPubkeys.length > 0 && (
                        <MentionedUsers pubkeys={question.mentionedPubkeys} />
                    )}
                </header>

                {/* Question body */}
                <div className="flex gap-4">
                    {/* Vote column */}
                    <div className="shrink-0 hidden sm:block">
                        <Votes
                            kind={constants.questionKind}
                            eventId={question.eventId}
                            pubkey={question.user.pubkey}
                            identifier={question.id}
                        />
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                        {/* Markdown content */}
                        <div className="question-detail prose prose-slate dark:prose-invert max-w-none prose-sm sm:prose-base">
                            <MDEditor.Markdown
                                source={question?.description ?? ''}
                                style={{
                                    whiteSpace: 'pre-wrap',
                                    fontFamily: 'Mona Sans, sans-serif'
                                }}
                                className="!bg-transparent !text-slate-700 dark:!text-slate-300"
                            />
                        </div>

                        {/* Tags */}
                        {question?.tags && question.tags.length > 0 && (
                            <div className="flex gap-1 sm:gap-1.5 mt-4 sm:mt-6 flex-wrap">
                                {question.tags.map((tag, index) => (
                                    <span
                                        key={`${tag}-${index}-${question?.id}`}
                                        className="inline-flex items-center rounded bg-slate-100 dark:bg-slate-800 px-1.5 sm:px-2 py-0.5 text-[11px] sm:text-xs font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 cursor-pointer transition-colors"
                                    >
                                        <span className="text-slate-400 dark:text-slate-500 mr-0.5">#</span>{tag}
                                    </span>
                                ))}
                            </div>
                        )}

                        {/* Footer: votes + actions */}
                        <div className="flex items-center justify-between sm:justify-start gap-3 sm:gap-4 mt-4 sm:mt-6 text-xs font-medium text-slate-500 dark:text-slate-400">
                            {/* Mobile votes - left side */}
                            <div className="sm:hidden">
                                <Votes
                                    kind={constants.questionKind}
                                    eventId={question.eventId}
                                    pubkey={question.user.pubkey}
                                    identifier={question.id}
                                    horizontal={true}
                                />
                            </div>
                            {/* Desktop: text link matching ActionItems style */}
                            <div className="hidden sm:block">
                                <BookmarkButton
                                    questionId={question.id}
                                    questionPubkey={question.user.pubkey}
                                    variant="link"
                                />
                            </div>
                            {/* Actions group - bookmark + menu grouped on mobile */}
                            <div className="flex items-center gap-1">
                                {/* Mobile: bookmark icon */}
                                <div className="sm:hidden">
                                    <BookmarkButton
                                        questionId={question.id}
                                        questionPubkey={question.user.pubkey}
                                        variant="icon"
                                        size="sm"
                                    />
                                </div>
                                <ActionItems
                                    id={question.id}
                                    eventId={question.eventId}
                                    pubkey={question.user.pubkey}
                                    kind={constants.questionKind}
                                    editPath={`/questions/${question.id}/edit`}
                                />
                            </div>
                        </div>

                        {/* Comments */}
                        <CommentsList resource={question} resourceKind={constants.questionKind} />
                        <PostCommentBox resource={question} resourceKind={constants.questionKind} />
                    </div>
                </div>

                {/* Answers */}
                <AnswersContainer question={question} />
            </div>
        </>
    )
}

export default QuestionPage
