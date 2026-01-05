import {Link} from "react-router";
import {ChatBubbleOvalLeftEllipsisIcon} from "@heroicons/react/20/solid";
import {BellIcon} from "@heroicons/react/24/outline";
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
            <div className="flex-shrink-0">
                <Link
                    to={'/questions/new'}
                    className="relative inline-flex items-center gap-x-1.5 rounded-lg bg-teal-600 dark:bg-teal-500 px-3 py-2 text-sm font-semibold text-white hover:bg-teal-700 dark:hover:bg-teal-400 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-600 transition-colors"
                >
                    <ChatBubbleOvalLeftEllipsisIcon className="-ml-0.5 h-5 w-5" aria-hidden="true"/>
                    Ask Question
                </Link>
            </div>

            <div className="hidden md:ml-4 md:flex md:flex-shrink-0 md:items-center">
                <button
                    type="button"
                    className="relative rounded-full bg-white dark:bg-slate-800 p-1 text-slate-400 dark:text-slate-500 hover:text-slate-500 dark:hover:text-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2 dark:focus:ring-offset-slate-900"
                >
                    <span className="absolute -inset-1.5"/>
                    <span className="sr-only">View notifications</span>
                    <BellIcon className="h-6 w-6" aria-hidden="true"/>
                </button>

                {/* Profile dropdown */}
                <Menu as="div" className="relative ml-3">
                    <div>
                        <MenuButton
                            className="relative flex rounded-lg bg-white dark:bg-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2 dark:focus:ring-offset-slate-900">
                            <span className="absolute -inset-1.5"/>
                            <span className="sr-only">Open user menu</span>
                            {auth?.userProfile?.image || auth?.userProfile?.picture ? (
                                <img src={auth?.userProfile?.image ?? auth?.userProfile?.picture}
                                     alt="cover"
                                     className="h-8 w-8 rounded-lg object-cover"
                                />
                            ) : (
                                <span className="h-8 w-8 rounded-lg">
                                    <svg className="h-full w-full text-slate-400 dark:text-slate-500" fill="currentColor"
                                         viewBox="0 0 24 24">
                                        <path
                                            d="M24 20.993V24H0v-2.996A14.977 14.977 0 0112.004 15c4.904 0 9.26 2.354 11.996 5.993zM16.002 8.999a4 4 0 11-8 0 4 4 0 018 0z"/>
                                    </svg>
                                </span>
                            )}
                        </MenuButton>
                    </div>
                    <MenuItems
                        transition
                        className="absolute right-0 z-10 mt-2 w-48 origin-top-right rounded-md bg-white dark:bg-slate-800 py-1 shadow-lg ring-1 ring-black/5 dark:ring-white/10 focus:outline-none transition ease-out duration-200 data-[closed]:opacity-0 data-[closed]:scale-95">
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
            </div>
        </>
    )
}

export default UserMenuDesktop
