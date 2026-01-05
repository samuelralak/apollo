import {memo} from "react";
import type {Answer} from "../types/answer.types";
import Votes from "../../vote/components/Votes";
import constants from "../../../constants";
import MDEditor from "@uiw/react-md-editor";
import {formatDateTime} from "../../../utils";
import EventOwner from "../../user/components/EventOwner";
import {useSelector} from "react-redux";
import {RootState} from "../../../app/store";
import type {Question} from "../../question/types/question.types";
import AcceptAnswer from "./AcceptAnswer";
import {HugeiconsIcon} from "@hugeicons/react";
import {CheckmarkCircle02Icon as CheckmarkCircle02SolidIcon} from "@hugeicons-pro/core-solid-rounded";
import CommentsList from "../../comment/components/CommentList";
import PostCommentBox from "../../comment/components/PostCommentBox";
import ActionItems from "../../../shared/components/ActionItems";

interface AnswerItemProps {
    answer: Answer;
    question: Question;
    editAction?: () => void;
}

const AnswerItem = memo(({answer, question, editAction}: AnswerItemProps) => {
    const auth = useSelector((state: RootState) => state.auth);
    const isAccepted = question?.acceptedAnswerId === answer.id
    const canAccept = auth.isLoggedIn && question.user.pubkey === auth.pubkey && !isAccepted

    return (
        <div className={`flex gap-3 sm:gap-4 py-4 sm:py-6 ${isAccepted ? 'bg-green-50/50 dark:bg-green-900/10 -mx-3 sm:-mx-4 px-3 sm:px-4 rounded-lg' : ''}`}>
            {/* Vote column */}
            <div className="shrink-0 flex flex-col items-center gap-1">
                <Votes
                    kind={constants.answerKind}
                    eventId={answer.eventId}
                    identifier={answer.id ?? ""}
                    pubkey={answer.user.pubkey}
                    refEvent={answer.referenceEventId}
                />
                {isAccepted && (
                    <span title="Accepted answer">
                        <HugeiconsIcon icon={CheckmarkCircle02SolidIcon} className="text-green-500" size={20} />
                    </span>
                )}
                {canAccept && <AcceptAnswer answer={answer} question={question} />}
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
                <div className="prose prose-slate dark:prose-invert max-w-none prose-sm">
                    <MDEditor.Markdown
                        source={answer?.description ?? ''}
                        style={{
                            whiteSpace: 'pre-wrap',
                            fontFamily: 'Mona Sans, sans-serif'
                        }}
                        className="!bg-transparent !text-slate-700 dark:!text-slate-300"
                    />
                </div>

                {/* Footer: author left, actions right */}
                <div className="flex items-center justify-between gap-2 mt-4 sm:mt-6 text-xs text-slate-500 dark:text-slate-400">
                    <div className="flex items-center gap-1.5">
                        <EventOwner pubkey={answer.user.pubkey} mini={true} inline={true} />
                        <span>·</span>
                        <span>{formatDateTime(answer.createdAt)}</span>
                    </div>

                    <ActionItems
                        id={answer.id ?? ''}
                        eventId={answer.eventId}
                        pubkey={answer.user.pubkey}
                        kind={constants.answerKind}
                        editAction={editAction}
                    />
                </div>

                <div className="mt-4 sm:mt-6">
                    <CommentsList resource={answer} resourceKind={constants.answerKind} />
                    <PostCommentBox resource={answer} resourceKind={constants.answerKind} />
                </div>
            </div>
        </div>
    );
});

AnswerItem.displayName = 'AnswerItem';

export default AnswerItem;
