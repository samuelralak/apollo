import type {Answer} from "../types/answer.types";
import Votes from "../../vote/components/Votes";
import constants from "../../../constants";
import MDEditor from "@uiw/react-md-editor";
import {formatDateTime} from "../../../utils";
import EventOwner from "../../user/components/EventOwner";
import {useDispatch, useSelector} from "react-redux";
import {AppDispatch, RootState} from "../../../app/store";
import {PortalID, showPortal} from "../../../shared/store/portal.slice";
import type {Question} from "../../question/types/question.types";
import AcceptAnswer from "./AcceptAnswer";
import {CheckCircleIcon} from "@heroicons/react/24/solid";
import CommentsList from "../../comment/components/CommentList";
import PostCommentBox from "../../comment/components/PostCommentBox";

const AnswerItem = ({answer, question, editAction}: {
    answer: Answer,
    question: Question,
    editAction?: () => void
}) => {
    const auth = useSelector((state: RootState) => state.auth);
    const dispatch = useDispatch() as AppDispatch
    const isAccepted = question?.acceptedAnswerId === answer.id
    const canAccept = auth.isLoggedIn && question.user.pubkey === auth.pubkey && !isAccepted

    const handleShowModal = (portalId: PortalID) => dispatch(showPortal({
        portalId: portalId,
        pubkey: answer.user.pubkey,
        eventId: answer.eventId,
        eventCoordinate: `${constants.answerKind}:${answer.user.pubkey}:${answer.id}`
    }))

    return (
        <div className={`flex gap-4 py-6 ${isAccepted ? 'bg-green-50/50 dark:bg-green-900/10 -mx-4 px-4 rounded-lg' : ''}`}>
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
                    <CheckCircleIcon className="text-green-500 h-5 w-5" title="Accepted answer" />
                )}
                {canAccept && <AcceptAnswer answer={answer} />}
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

                {/* Footer: actions left, author right */}
                <div className="flex items-center justify-between mt-6 text-xs text-slate-500 dark:text-slate-400">
                    <div className="flex items-center gap-3 font-medium">
                        <a onClick={() => handleShowModal(PortalID.share)}
                           className="hover:text-slate-700 dark:hover:text-slate-200 cursor-pointer transition-colors">
                            Share
                        </a>
                        {auth.isLoggedIn && (
                            <>
                                <a onClick={() => handleShowModal(PortalID.zap)}
                                   className="hover:text-slate-700 dark:hover:text-slate-200 cursor-pointer transition-colors">
                                    Zap
                                </a>
                                {auth.pubkey === answer.user.pubkey && editAction && (
                                    <a onClick={editAction}
                                       className="hover:text-slate-700 dark:hover:text-slate-200 cursor-pointer transition-colors">
                                        Edit
                                    </a>
                                )}
                            </>
                        )}
                    </div>
                    <div className="flex items-center gap-1.5">
                        <EventOwner pubkey={answer.user.pubkey} mini={true} />
                        <span>·</span>
                        <span>{formatDateTime(answer.createdAt)}</span>
                    </div>
                </div>

                <div className="mt-6">
                    <CommentsList resource={answer} resourceKind={constants.answerKind} />
                    <PostCommentBox resource={answer} resourceKind={constants.answerKind} />
                </div>
            </div>
        </div>
    )
}

export default AnswerItem
