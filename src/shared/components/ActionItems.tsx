import {classNames} from "../../utils";
import {Menu, MenuButton, MenuItems, MenuItem} from "@headlessui/react";
import {EllipsisVerticalIcon} from "@heroicons/react/20/solid";
import {useDispatch, useSelector} from "react-redux";
import {AppDispatch, RootState} from "../../app/store";
import {Link} from "react-router";
import {PortalID, showPortal} from "../store/portal.slice";
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
        <div className="flex flex-row gap-x-2 text-xs sm:text-sm font-medium text-slate-500 dark:text-slate-400">
            <a onClick={() => handleShowModal(PortalID.share)}
               className="hidden sm:block items-center gap-x-1.5 w-auto hover:text-slate-700 dark:hover:text-slate-200 cursor-pointer transition-colors"
            >
                <span className="hidden sm:block">Share</span>
            </a>
            {auth.isLoggedIn && (
                <>
                    <a onClick={() => handleShowModal(PortalID.zap)}
                       className="hidden sm:block items-center gap-x-1.5 hover:text-slate-700 dark:hover:text-slate-200 cursor-pointer transition-colors">
                        <span className="hidden sm:block">Zap</span>
                    </a>
                    {auth.pubkey === props.pubkey && (
                        <Link to={`/questions/${props.id}/edit`}
                              className="hidden sm:block items-center gap-x-1.5 hover:text-slate-700 dark:hover:text-slate-200 cursor-pointer transition-colors">
                            <span className="hidden sm:block">Edit</span>
                        </Link>
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

                                {auth.pubkey === props.pubkey && (
                                    <MenuItem>
                                        {({focus}) => (
                                            <Link
                                                to={`/questions/${props.id}/edit`}
                                                className={classNames(
                                                    focus ? 'bg-slate-100 dark:bg-slate-700 text-slate-900 dark:text-slate-100' : 'text-slate-700 dark:text-slate-200',
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
