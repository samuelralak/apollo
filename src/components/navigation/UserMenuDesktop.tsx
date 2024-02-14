import {Link} from "react-router-dom";
import {PlusIcon} from "@heroicons/react/20/solid";
import {BellIcon} from "@heroicons/react/24/outline";
import {Menu, Transition} from "@headlessui/react";
import {Fragment} from "react";
import {classNames} from "../../utils";
import {useDispatch} from "react-redux";
import {AppDispatch} from "../../store";
import {AuthState, signOut} from "../../features/auth/auth-slice.ts";

const UserMenuDesktop = ({auth}: { auth: AuthState }) => {
    const dispatch = useDispatch() as AppDispatch
    const onSignOut = () => dispatch(signOut())

    return (
        <>
            <div className="flex-shrink-0">
                <Link
                    to={'/questions/new'}
                    className="relative inline-flex items-center gap-x-1.5 rounded-md bg-blue-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
                >
                    <PlusIcon className="-ml-0.5 h-5 w-5" aria-hidden="true"/>
                    Ask Question
                </Link>
            </div>

            <div className="hidden md:ml-4 md:flex md:flex-shrink-0 md:items-center">
                <button
                    type="button"
                    className="relative rounded-full bg-white p-1 text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                >
                    <span className="absolute -inset-1.5"/>
                    <span className="sr-only">View notifications</span>
                    <BellIcon className="h-6 w-6" aria-hidden="true"/>
                </button>

                {/* Profile dropdown */}
                <Menu as="div" className="relative ml-3">
                    <div>
                        <Menu.Button
                            className="relative flex rounded-lg bg-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2">
                            <span className="absolute -inset-1.5"/>
                            <span className="sr-only">Open user menu</span>
                            {auth?.userProfile?.image || auth?.userProfile?.picture ? (
                                <img src={auth?.userProfile?.image ?? auth?.userProfile?.picture}
                                     alt="cover"
                                     className="h-8 w-8 rounded-lg object-cover"
                                />
                            ) : (
                                <span className="h-8 w-8 rounded-lg">
                                    <svg className="h-full w-full text-gray-300" fill="currentColor"
                                         viewBox="0 0 24 24">
                                        <path
                                            d="M24 20.993V24H0v-2.996A14.977 14.977 0 0112.004 15c4.904 0 9.26 2.354 11.996 5.993zM16.002 8.999a4 4 0 11-8 0 4 4 0 018 0z"/>
                                    </svg>
                                </span>
                            )}
                        </Menu.Button>
                    </div>
                    <Transition
                        as={Fragment}
                        enter="transition ease-out duration-200"
                        enterFrom="transform opacity-0 scale-95"
                        enterTo="transform opacity-100 scale-100"
                        leave="transition ease-in duration-75"
                        leaveFrom="transform opacity-100 scale-100"
                        leaveTo="transform opacity-0 scale-95"
                    >
                        <Menu.Items
                            className="absolute right-0 z-10 mt-2 w-48 origin-top-right rounded-md bg-white py-1 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                            <Menu.Item>
                                {({active}) => (
                                    <Link
                                        to={`/user/${auth.pubkey}`}
                                        className={classNames(
                                            active ? 'bg-gray-100' : '',
                                            'block px-4 py-2 text-sm text-gray-700'
                                        )}
                                    >
                                        Your Profile
                                    </Link>
                                )}
                            </Menu.Item>
                            <Menu.Item>
                                {({active}) => (
                                    <Link
                                        to={`/settings/user-profile`}
                                        className={classNames(
                                            active ? 'bg-gray-100' : '',
                                            'block px-4 py-2 text-sm text-gray-700'
                                        )}
                                    >
                                        Settings
                                    </Link>
                                )}
                            </Menu.Item>
                            <Menu.Item>
                                {({active}) => (
                                    <a
                                        onClick={onSignOut}
                                        className={classNames(
                                            active ? 'bg-gray-100' : '',
                                            'block px-4 py-2 text-sm text-gray-700'
                                        )}
                                    >
                                        Sign out
                                    </a>
                                )}
                            </Menu.Item>
                        </Menu.Items>
                    </Transition>
                </Menu>
            </div>
        </>
    )
}

export default UserMenuDesktop
