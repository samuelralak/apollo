import {Link} from "react-router";
import {HugeiconsIcon} from "@hugeicons/react";
import {MessageAdd01Icon, UserCircleIcon} from "@hugeicons-pro/core-duotone-rounded";
import {UserCircleIcon as UserCircleOutlineIcon, Bookmark02Icon, Settings01Icon, Logout01Icon} from "@hugeicons-pro/core-twotone-rounded";
import {Menu, MenuButton, MenuItems, MenuItem} from "@headlessui/react";
import {useDispatch, useSelector} from "react-redux";
import {AppDispatch, RootState} from "../../../app/store";
import {AuthState, signOut} from "../store/auth.slice";
import {NotificationBell} from "../../notification/components";

const UserMenuDesktop = ({auth}: { auth: AuthState }) => {
    const dispatch = useDispatch() as AppDispatch
    const showNotifications = useSelector((state: RootState) => state.notification.settings.showInApp);
    const onSignOut = () => dispatch(signOut())

    return (
        <>
            <Link
                to={'/questions/new'}
                className="inline-flex items-center gap-x-1.5 rounded-lg bg-teal-600 dark:bg-teal-500 p-2 md:px-3 md:py-2 text-sm font-semibold text-white hover:bg-teal-700 dark:hover:bg-teal-400 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-600 transition-colors"
                aria-label="Ask Question"
            >
                <HugeiconsIcon icon={MessageAdd01Icon} size={20} className="md:-ml-0.5" />
                <span className="hidden md:inline">Ask Question</span>
            </Link>

            {showNotifications && <NotificationBell />}

            {/* Profile dropdown */}
            <Menu as="div" className="relative hidden md:block">
                <MenuButton className="relative flex rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2 dark:focus:ring-offset-slate-900">
                    <span className="sr-only">Open user menu</span>
                    {auth?.userProfile?.image || auth?.userProfile?.picture ? (
                        <img
                            src={auth?.userProfile?.image ?? auth?.userProfile?.picture}
                            alt="avatar"
                            className="h-8 w-8 rounded-lg object-cover"
                        />
                    ) : (
                        <span className="h-8 w-8 rounded-lg flex items-center justify-center bg-slate-200 dark:bg-slate-700">
                            <HugeiconsIcon icon={UserCircleIcon} size={24} className="text-slate-400 dark:text-slate-500" />
                        </span>
                    )}
                </MenuButton>
                <MenuItems
                    transition
                    className="absolute right-0 z-10 mt-2 w-56 origin-top-right rounded-xl bg-white dark:bg-slate-800 shadow-lg ring-1 ring-slate-200 dark:ring-slate-700 focus:outline-none transition ease-out duration-200 data-[closed]:opacity-0 data-[closed]:scale-95"
                >
                    {/* User info header */}
                    <div className="px-4 py-3 border-b border-slate-100 dark:border-slate-700">
                        <p className="text-sm font-medium text-slate-900 dark:text-slate-100 truncate">
                            {auth.userProfile?.displayName ?? auth.userProfile?.name ?? 'Anonymous'}
                        </p>
                        {auth.userProfile?.nip05 && (
                            <p className="text-xs text-slate-500 dark:text-slate-400 truncate mt-0.5">
                                {auth.userProfile.nip05}
                            </p>
                        )}
                    </div>

                    {/* Navigation items */}
                    <div className="py-1">
                        <MenuItem>
                            {({focus}) => (
                                <Link
                                    to={`/user/${auth.pubkey}`}
                                    className={`flex items-center gap-3 px-4 py-2 text-sm text-slate-700 dark:text-slate-200 ${focus ? 'bg-slate-50 dark:bg-slate-700/50' : ''}`}
                                >
                                    <HugeiconsIcon icon={UserCircleOutlineIcon} size={18} className="text-slate-400 dark:text-slate-500" />
                                    Your Profile
                                </Link>
                            )}
                        </MenuItem>
                        <MenuItem>
                            {({focus}) => (
                                <Link
                                    to="/bookmarks"
                                    className={`flex items-center gap-3 px-4 py-2 text-sm text-slate-700 dark:text-slate-200 ${focus ? 'bg-slate-50 dark:bg-slate-700/50' : ''}`}
                                >
                                    <HugeiconsIcon icon={Bookmark02Icon} size={18} className="text-slate-400 dark:text-slate-500" />
                                    Bookmarks
                                </Link>
                            )}
                        </MenuItem>
                        <MenuItem>
                            {({focus}) => (
                                <Link
                                    to="/settings/user-profile"
                                    className={`flex items-center gap-3 px-4 py-2 text-sm text-slate-700 dark:text-slate-200 ${focus ? 'bg-slate-50 dark:bg-slate-700/50' : ''}`}
                                >
                                    <HugeiconsIcon icon={Settings01Icon} size={18} className="text-slate-400 dark:text-slate-500" />
                                    Settings
                                </Link>
                            )}
                        </MenuItem>
                    </div>

                    {/* Sign out - separated */}
                    <div className="border-t border-slate-100 dark:border-slate-700 py-1">
                        <MenuItem>
                            {({focus}) => (
                                <button
                                    type="button"
                                    onClick={onSignOut}
                                    className={`flex items-center gap-3 w-full px-4 py-2 text-sm text-slate-700 dark:text-slate-200 ${focus ? 'bg-slate-50 dark:bg-slate-700/50' : ''}`}
                                >
                                    <HugeiconsIcon icon={Logout01Icon} size={18} className="text-slate-400 dark:text-slate-500" />
                                    Sign out
                                </button>
                            )}
                        </MenuItem>
                    </div>
                </MenuItems>
            </Menu>
        </>
    )
}

export default UserMenuDesktop
