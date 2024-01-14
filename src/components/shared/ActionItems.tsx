import {classNames} from "../../utils";
import {Menu, Transition} from "@headlessui/react";
import {EllipsisVerticalIcon} from "@heroicons/react/20/solid";
import {Fragment} from "react";
import {useDispatch, useSelector} from "react-redux";
import {AppDispatch, RootState} from "../../store";
import {Link} from "react-router-dom";
import {PortalID, showPortal} from "../../features/portal/portal-slice.ts";
import constants from "../../constants";

const ActionItems = (props: { id: string, eventId: string, pubkey: string }) => {
    const auth = useSelector((state: RootState) => state.auth);
    const dispatch = useDispatch() as AppDispatch

    const handleShowModal = (portalId: PortalID) => dispatch(showPortal({
        portalId: portalId,
        pubkey: props.pubkey,
        eventId: props.eventId,
        eventCoordinate: `${constants.questionKind}:${props.pubkey}:${props.id}`
    }))

    return (
        <div className="flex flex-row gap-x-2 text-xs sm:text-sm font-medium text-slate-500">
            <a onClick={() => handleShowModal(PortalID.share)}
               className="hidden sm:block items-center gap-x-1.5 w-auto hover:text-slate-700 cursor-pointer"
            >
                <span className="hidden sm:block">Share</span>
            </a>
            {auth.isLoggedIn && (
                <>
                    <a onClick={() => handleShowModal(PortalID.zap)}
                       className="hidden sm:block items-center gap-x-1.5 hover:text-slate-700 cursor-pointer">
                        <span className="hidden sm:block">Zap</span>
                    </a>
                    {auth.pubkey === props.pubkey && (
                        <Link to={`/questions/${props.id}/edit`}
                              className="hidden sm:block items-center gap-x-1.5 hover:text-slate-700 cursor-pointer">
                            <span className="hidden sm:block">Edit</span>
                        </Link>
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

                                    {auth.pubkey === props.pubkey && (
                                        <Menu.Item>
                                            {({active}) => (
                                                <Link
                                                    to={`/questions/${props.id}/edit`}
                                                    className={classNames(
                                                        active ? 'bg-gray-100 text-gray-900' : 'text-gray-700',
                                                        'block px-4 py-2 text-sm'
                                                    )}
                                                >
                                                    Edit
                                                </Link>
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
    )
}

export default ActionItems
