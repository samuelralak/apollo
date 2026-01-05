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
import {PortalID, showPortal} from "../../portal/store/portal.slice";
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
                <div className="question-detail">
                    <MDEditor.Markdown
                        source={answer?.description ?? ''}
                        style={{
                            whiteSpace: 'pre-wrap',
                            backgroundColor: 'white',
                            color: '#334155',
                            fontFamily: 'Public Sans, sans-serif'
                        }}
                        data-color-mode={'light'}
                        className="bg-white text-slate-700 prose prose-slate"
                    />
                </div>


                <div className="flex py-3 justify-between items-center align-middle">
                    <div>
                        <p className="text-xs font-semibold text-slate-500 pb-1">
                            <span
                                className="font-bold text-slate-700">answered</span> {formatDateTime(answer.createdAt)}
                        </p>
                        <EventOwner pubkey={answer.user.pubkey}/>
                    </div>

                    <div className="flex flex-row gap-x-2 text-xs sm:text-sm font-medium text-slate-500">
                        <a onClick={() => handleShowModal(PortalID.share)}
                           className="hidden sm:block items-center gap-x-1.5 w-auto hover:text-slate-700 cursor-pointer">
                            <span className="hidden sm:block">Share</span>
                        </a>
                        {auth.isLoggedIn && (
                            <>
                                <a onClick={() => handleShowModal(PortalID.zap)}
                                   className="hidden sm:block items-center gap-x-1.5 hover:text-slate-700 cursor-pointer">
                                    <span className="hidden sm:block">Zap</span>
                                </a>
                                {auth.pubkey === answer.user.pubkey && (
                                    <a onClick={editAction}
                                       className="hidden sm:block items-center gap-x-1.5 hover:text-slate-700 cursor-pointer">
                                        <span className="hidden sm:block">Edit</span>
                                    </a>
                                )}
                            </>
                        )}

                        <Menu as="div" className="relative inline-block text-left sm:hidden">
                            <div>
                                <MenuButton
                                    className="flex items-center text-gray-400 hover:text-gray-600 outline-none ring-0 ">
                                    <span className="sr-only">Open options</span>
                                    <EllipsisVerticalIcon className="h-5 w-5" aria-hidden="true"/>
                                </MenuButton>
                            </div>

                            <MenuItems
                                transition
                                className="absolute right-0 z-10 mt-2 w-56 origin-top-right rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none transition ease-out duration-100 data-[closed]:opacity-0 data-[closed]:scale-95">
                                <div className="py-1">
                                    <MenuItem>
                                        {({focus}) => (
                                            <a
                                                onClick={() => handleShowModal(PortalID.share)}
                                                className={classNames(
                                                    focus ? 'bg-gray-100 text-gray-900' : 'text-gray-700',
                                                    'block px-4 py-2 text-sm'
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
                                                    className='text-gray-700 block px-4 py-2 text-sm data-[focus]:bg-gray-100 data-[focus]:text-gray-900'
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
                                                                focus ? 'bg-gray-100 text-gray-900' : 'text-gray-700',
                                                                'block px-4 py-2 text-sm'
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
