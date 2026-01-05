import type {Answer} from "../types/answer.types";
import Votes from "../../vote/components/Votes";
import constants from "../../../constants";
import MDEditor from "@uiw/react-md-editor";
import {classNames, formatDateTime} from "../../../utils";
import EventOwner from "../../user/components/EventOwner";
import {Menu, MenuButton, MenuItems, MenuItem} from "@headlessui/react";
import {EllipsisVerticalIcon} from "@heroicons/react/20/solid";
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

    const handleShowModal = (portalId: PortalID) => dispatch(showPortal({
        portalId: portalId,
        pubkey: answer.user.pubkey,
        eventId: answer.eventId,
        eventCoordinate: `${constants.answerKind}:${answer.user.pubkey}:${answer.id}`
    }))

    return (
        <div className="flex flex-row gap-x-4 pt-4" key={answer.id}>
            <div className="flex flex-col gap-y-1.5 justify-start items-center">
                <Votes kind={constants.answerKind}
                       eventId={answer.eventId}
                       identifier={answer.id ?? ""}
                       pubkey={answer.user.pubkey}
                       refEvent={answer.referenceEventId}
                />

                {question?.acceptedAnswerId === answer.id ? (
                    <CheckCircleIcon className="text-green-500 h-6 w-6 cursor-pointer" />
                ) : auth.isLoggedIn && question.user.pubkey === auth.pubkey && (
                    <AcceptAnswer answer={answer} />
                )}
            </div>

            <div className="flex-1">
                <div className="question-detail prose prose-slate dark:prose-invert max-w-none">
                    <MDEditor.Markdown
                        source={answer?.description ?? ''}
                        style={{
                            whiteSpace: 'pre-wrap',
                            fontFamily: 'Public Sans, sans-serif'
                        }}
                        className="!bg-transparent !text-slate-700 dark:!text-slate-300"
                    />
                </div>


                <div className="flex py-3 justify-between items-center align-middle">
                    <div>
                        <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 pb-1">
                            <span
                                className="font-bold text-slate-700 dark:text-slate-300">answered</span> {formatDateTime(answer.createdAt)}
                        </p>
                        <EventOwner pubkey={answer.user.pubkey}/>
                    </div>

                    <div className="flex flex-row gap-x-2 text-xs sm:text-sm font-medium text-slate-500 dark:text-slate-400">
                        <a onClick={() => handleShowModal(PortalID.share)}
                           className="hidden sm:block items-center gap-x-1.5 w-auto hover:text-slate-700 dark:hover:text-slate-200 cursor-pointer transition-colors">
                            <span className="hidden sm:block">Share</span>
                        </a>
                        {auth.isLoggedIn && (
                            <>
                                <a onClick={() => handleShowModal(PortalID.zap)}
                                   className="hidden sm:block items-center gap-x-1.5 hover:text-slate-700 dark:hover:text-slate-200 cursor-pointer transition-colors">
                                    <span className="hidden sm:block">Zap</span>
                                </a>
                                {auth.pubkey === answer.user.pubkey && (
                                    <a onClick={editAction}
                                       className="hidden sm:block items-center gap-x-1.5 hover:text-slate-700 dark:hover:text-slate-200 cursor-pointer transition-colors">
                                        <span className="hidden sm:block">Edit</span>
                                    </a>
                                )}
                            </>
                        )}

                        <Menu as="div" className="relative inline-block text-left sm:hidden">
                            <div>
                                <MenuButton
                                    className="flex items-center text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300 outline-none ring-0">
                                    <span className="sr-only">Open options</span>
                                    <EllipsisVerticalIcon className="h-5 w-5" aria-hidden="true"/>
                                </MenuButton>
                            </div>

                            <MenuItems
                                transition
                                className="absolute right-0 z-10 mt-2 w-56 origin-top-right rounded-md bg-white dark:bg-slate-800 shadow-lg ring-1 ring-black/5 dark:ring-white/10 focus:outline-none transition ease-out duration-100 data-[closed]:opacity-0 data-[closed]:scale-95">
                                <div className="py-1">
                                    <MenuItem>
                                        {({focus}) => (
                                            <a
                                                onClick={() => handleShowModal(PortalID.share)}
                                                className={classNames(
                                                    focus ? 'bg-slate-100 dark:bg-slate-700 text-slate-900 dark:text-slate-100' : 'text-slate-700 dark:text-slate-200',
                                                    'block px-4 py-2 text-sm cursor-pointer'
                                                )}
                                            >
                                                Share
                                            </a>
                                        )}
                                    </MenuItem>
                                    {auth.isLoggedIn && (
                                        <>
                                            <MenuItem>
                                                <a
                                                    onClick={() => handleShowModal(PortalID.zap)}
                                                    className='text-slate-700 dark:text-slate-200 block px-4 py-2 text-sm cursor-pointer data-[focus]:bg-slate-100 dark:data-[focus]:bg-slate-700 data-[focus]:text-slate-900 dark:data-[focus]:text-slate-100'
                                                >
                                                    Zap
                                                </a>
                                            </MenuItem>
                                            {auth.pubkey === answer.user.pubkey && (
                                                <MenuItem>
                                                    {({focus}) => (
                                                        <a
                                                            onClick={editAction}
                                                            className={classNames(
                                                                focus ? 'bg-slate-100 dark:bg-slate-700 text-slate-900 dark:text-slate-100' : 'text-slate-700 dark:text-slate-200',
                                                                'block px-4 py-2 text-sm cursor-pointer'
                                                            )}
                                                        >
                                                            Edit
                                                        </a>
                                                    )}
                                                </MenuItem>
                                            )}
                                        </>
                                    )}
                                </div>
                            </MenuItems>
                        </Menu>
                    </div>
                </div>

                <CommentsList resource={answer} resourceKind={constants.answerKind} />
                <PostCommentBox resource={answer} resourceKind={constants.answerKind} />
            </div>
        </div>
    )
}

export default AnswerItem
