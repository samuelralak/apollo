import {Menu, MenuButton, MenuItems, MenuItem} from "@headlessui/react";
import {HugeiconsIcon} from "@hugeicons/react";
import {MoreHorizontalIcon} from "@hugeicons-pro/core-twotone-rounded";
import {useDispatch, useSelector} from "react-redux";
import {AppDispatch, RootState} from "../../app/store";
import {Link} from "react-router";
import {PortalID, showPortal} from "../store/portal.slice";

interface ActionItemsProps {
    id: string;
    eventId: string;
    pubkey: string;
    kind: number;
    editAction?: () => void;
    editPath?: string;
}

const ActionItems = ({id, eventId, pubkey, kind, editAction, editPath}: ActionItemsProps) => {
    const auth = useSelector((state: RootState) => state.auth);
    const dispatch = useDispatch() as AppDispatch

    const handleShowModal = (portalId: PortalID) => dispatch(showPortal({
        portalId: portalId,
        pubkey: pubkey,
        eventId: eventId,
        eventCoordinate: `${kind}:${pubkey}:${id}`
    }))

    return (
        <div className="flex items-center text-xs font-medium text-slate-500 dark:text-slate-400">
            {/* Desktop: text links */}
            <div className="hidden sm:flex items-center gap-x-4">
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
                        {auth.pubkey === pubkey && (editAction || editPath) && (
                            editAction ? (
                                <a onClick={editAction}
                                   className="hover:text-slate-700 dark:hover:text-slate-200 cursor-pointer transition-colors">
                                    Edit
                                </a>
                            ) : editPath ? (
                                <Link to={editPath}
                                      className="hover:text-slate-700 dark:hover:text-slate-200 transition-colors">
                                    Edit
                                </Link>
                            ) : null
                        )}
                    </>
                )}
            </div>

            {/* Mobile: dropdown menu */}
            <Menu as="div" className="relative sm:hidden">
                <MenuButton className="p-1 -m-1 text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300">
                    <span className="sr-only">Actions</span>
                    <HugeiconsIcon icon={MoreHorizontalIcon} size={20} />
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
                                {auth.pubkey === pubkey && (editAction || editPath) && (
                                    <MenuItem>
                                        {editAction ? (
                                            <a onClick={editAction}
                                               className="block px-3 py-1.5 text-sm text-slate-700 dark:text-slate-200 data-[focus]:bg-slate-100 dark:data-[focus]:bg-slate-700 cursor-pointer">
                                                Edit
                                            </a>
                                        ) : editPath ? (
                                            <Link to={editPath}
                                                  className="block px-3 py-1.5 text-sm text-slate-700 dark:text-slate-200 data-[focus]:bg-slate-100 dark:data-[focus]:bg-slate-700">
                                                Edit
                                            </Link>
                                        ) : null}
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
