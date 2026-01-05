import {Link} from "react-router";
import {HugeiconsIcon} from "@hugeicons/react";
import {MessageAdd01Icon, Notification01Icon, UserCircleIcon} from "@hugeicons-pro/core-twotone-rounded";
import {Menu, MenuButton, MenuItems, MenuItem} from "@headlessui/react";
import {classNames} from "../../../utils";
import {useDispatch} from "react-redux";
import {AppDispatch} from "../../../app/store";
import {AuthState, signOut} from "../store/auth.slice";

const UserMenuDesktop = ({auth}: { auth: AuthState }) => {
    const dispatch = useDispatch() as AppDispatch
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

            <button
                type="button"
                className="hidden md:block relative rounded-full p-2 text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2 dark:focus:ring-offset-slate-900 transition-colors"
            >
                <span className="sr-only">View notifications</span>
                <HugeiconsIcon icon={Notification01Icon} size={20} />
            </button>

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
                    className="absolute right-0 z-10 mt-2 w-48 origin-top-right rounded-md bg-white dark:bg-slate-800 py-1 shadow-lg ring-1 ring-black/5 dark:ring-white/10 focus:outline-none transition ease-out duration-200 data-[closed]:opacity-0 data-[closed]:scale-95"
                >
                    <MenuItem>
                        {({focus}) => (
                            <Link
                                to={`/user/${auth.pubkey}`}
                                className={classNames(
                                    focus ? 'bg-slate-100 dark:bg-slate-700' : '',
                                    'block px-4 py-2 text-sm text-slate-700 dark:text-slate-200'
                                )}
                            >
                                Your Profile
                            </Link>
                        )}
                    </MenuItem>
                    <MenuItem>
                        {({focus}) => (
                            <Link
                                to={`/settings/user-profile`}
                                className={classNames(
                                    focus ? 'bg-slate-100 dark:bg-slate-700' : '',
                                    'block px-4 py-2 text-sm text-slate-700 dark:text-slate-200'
                                )}
                            >
                                Settings
                            </Link>
                        )}
                    </MenuItem>
                    <MenuItem>
                        {({focus}) => (
                            <a
                                onClick={onSignOut}
                                className={classNames(
                                    focus ? 'bg-slate-100 dark:bg-slate-700' : '',
                                    'block px-4 py-2 text-sm text-slate-700 dark:text-slate-200 cursor-pointer'
                                )}
                            >
                                Sign out
                            </a>
                        )}
                    </MenuItem>
                </MenuItems>
            </Menu>
        </>
    )
}

export default UserMenuDesktop
