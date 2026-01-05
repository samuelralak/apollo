import {memo} from "react";
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
import {EllipsisHorizontalIcon} from "@heroicons/react/20/solid";
import {Menu, MenuButton, MenuItem, MenuItems} from "@headlessui/react";
import CommentsList from "../../comment/components/CommentList";
import PostCommentBox from "../../comment/components/PostCommentBox";

interface AnswerItemProps {
    answer: Answer;
    question: Question;
    editAction?: () => void;
}

const AnswerItem = memo(({answer, question, editAction}: AnswerItemProps) => {
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
                    <CheckCircleIcon className="text-green-500 h-4 w-4 sm:h-5 sm:w-5" title="Accepted answer" />
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

                    {/* Desktop: text links */}
                    <div className="hidden sm:flex items-center gap-3 font-medium">
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

                    {/* Mobile: dropdown menu */}
                    <Menu as="div" className="relative sm:hidden">
                        <MenuButton className="p-1 -m-1 text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300">
                            <span className="sr-only">Actions</span>
                            <EllipsisHorizontalIcon className="h-5 w-5" />
                        </MenuButton>
                        <MenuItems className="absolute right-0 z-10 mt-1 w-32 origin-top-right rounded-md bg-white dark:bg-slate-800 shadow-lg ring-1 ring-black/5 dark:ring-white/10 focus:outline-none">
                            <div className="py-1">
                                <MenuItem>
                                    <a
                                        onClick={() => handleShowModal(PortalID.share)}
                                        className="block px-3 py-1.5 text-sm text-slate-700 dark:text-slate-200 data-[focus]:bg-slate-100 dark:data-[focus]:bg-slate-700 cursor-pointer"
                                    >
                                        Share
                                    </a>
                                </MenuItem>
                                {auth.isLoggedIn && (
                                    <>
                                        <MenuItem>
                                            <a
                                                onClick={() => handleShowModal(PortalID.zap)}
                                                className="block px-3 py-1.5 text-sm text-slate-700 dark:text-slate-200 data-[focus]:bg-slate-100 dark:data-[focus]:bg-slate-700 cursor-pointer"
                                            >
                                                Zap
                                            </a>
                                        </MenuItem>
                                        {auth.pubkey === answer.user.pubkey && editAction && (
                                            <MenuItem>
                                                <a
                                                    onClick={editAction}
                                                    className="block px-3 py-1.5 text-sm text-slate-700 dark:text-slate-200 data-[focus]:bg-slate-100 dark:data-[focus]:bg-slate-700 cursor-pointer"
                                                >
                                                    Edit
                                                </a>
                                            </MenuItem>
                                        )}
                                    </>
                                )}
                            </div>
                        </MenuItems>
                    </Menu>
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
