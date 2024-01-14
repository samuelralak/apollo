import {Answer} from "../../resources/answer.ts";
import Votes from "../shared/Votes.tsx";
import constants from "../../constants";
import MDEditor from "@uiw/react-md-editor";
import {classNames, formatDateTime} from "../../utils";
import EventOwner from "../shared/EventOwner.tsx";
import {Menu, Transition} from "@headlessui/react";
import {EllipsisVerticalIcon} from "@heroicons/react/20/solid";
import {Fragment} from "react";
import {useDispatch, useSelector} from "react-redux";
import {AppDispatch, RootState} from "../../store";
import {PortalID, showPortal} from "../../features/portal/portal-slice.ts";
import {CheckCircleIcon} from "@heroicons/react/24/solid";
import Question from "../../resources/question.ts";

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
            <div className="flex flex-col gap-y-1.5 justify-center items-center">
                <Votes kind={constants.answerKind}
                       eventId={answer.eventId}
                       pubkey={answer.user.pubkey}
                       refEvent={answer.referenceEventId}
                />
                {auth.isLoggedIn && question.user.pubkey === auth.pubkey && (<button>
                    <CheckCircleIcon className="h-6 w-6 text-slate-300 hover:text-slate-400 cursor-pointer"/>
                </button>)}
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
                                <Menu.Button
                                    className="flex items-center text-gray-400 hover:text-gray-600 outline-none ring-0 ">
                                    <span className="sr-only">Open options</span>
                                    <EllipsisVerticalIcon className="h-5 w-5" aria-hidden="true"/>
                                </Menu.Button>
                            </div>

                            <Transition
                                as={Fragment}
                                enter="transition ease-out duration-100"
                                enterFrom="transform opacity-0 scale-95"
                                enterTo="transform opacity-100 scale-100"
                                leave="transition ease-in duration-75"
                                leaveFrom="transform opacity-100 scale-100"
                                leaveTo="transform opacity-0 scale-95"
                            >
                                <Menu.Items
                                    className="absolute right-0 z-10 mt-2 w-56 origin-top-right rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                                    <div className="py-1">
                                        <Menu.Item>
                                            {({active}) => (
                                                <a
                                                    onClick={() => handleShowModal(PortalID.share)}
                                                    className={classNames(
                                                        active ? 'bg-gray-100 text-gray-900' : 'text-gray-700',
                                                        'block px-4 py-2 text-sm'
                                                    )}
                                                >
                                                    Share
                                                </a>
                                            )}
                                        </Menu.Item>
                                        {auth.isLoggedIn && (
                                            <>
                                                <Menu.Item>
                                                    <a
                                                        onClick={() => handleShowModal(PortalID.zap)}
                                                        className='text-gray-700 block px-4 py-2 text-sm'
                                                    >
                                                        Zap
                                                    </a>
                                                </Menu.Item>
                                                {auth.pubkey === answer.user.pubkey && (
                                                    <Menu.Item>
                                                        {({active}) => (
                                                            <a
                                                                onClick={editAction}
                                                                className={classNames(
                                                                    active ? 'bg-gray-100 text-gray-900' : 'text-gray-700',
                                                                    'block px-4 py-2 text-sm'
                                                                )}
                                                            >
                                                                Edit
                                                            </a>
                                                        )}
                                                    </Menu.Item>
                                                )}
                                            </>
                                        )}
                                    </div>
                                </Menu.Items>
                            </Transition>
                        </Menu>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default AnswerItem
