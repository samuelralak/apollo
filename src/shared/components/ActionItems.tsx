import {classNames} from "../../utils";
import {Menu, MenuButton, MenuItems, MenuItem} from "@headlessui/react";
import {EllipsisVerticalIcon} from "@heroicons/react/20/solid";
import {useDispatch, useSelector} from "react-redux";
import {AppDispatch, RootState} from "../../app/store";
import {Link} from "react-router";
import {PortalID, showPortal} from "../../domains/portal/store/portal.slice";
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

                                {auth.pubkey === props.pubkey && (
                                    <MenuItem>
                                        {({focus}) => (
                                            <Link
                                                to={`/questions/${props.id}/edit`}
                                                className={classNames(
                                                    focus ? 'bg-gray-100 text-gray-900' : 'text-gray-700',
                                                    'block px-4 py-2 text-sm'
                                                )}
                                            >
                                                Edit
                                            </Link>
                                        )}
                                    </MenuItem>
                                )}
                            </>
                        )}
                    </div>
                </MenuItems>
            </Menu>
        </div>
    )
}

export default ActionItems
