import {Disclosure} from '@headlessui/react'
import {Bars3Icon, BellIcon, XMarkIcon} from '@heroicons/react/24/outline'
import {NavLink} from "react-router-dom";
import {useSelector} from "react-redux";
import {RootState} from "../store";
import UserMenu from "./navigation/UserMenu";
import GetStarted from "./navigation/GetStarted.tsx";

const MainNavigation = () => {
    const auth = useSelector((state: RootState) => state.auth)
    console.log({auth})

    return (
        <Disclosure as="nav" className="bg-white border-b">
            {({open}) => (
                <>
                    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                        <div className="flex h-16 justify-between">
                            <div className="flex">
                                <div className="-ml-2 mr-2 flex items-center md:hidden">
                                    {/* Mobile menu button */}
                                    <Disclosure.Button
                                        className="relative inline-flex items-center justify-center rounded-md p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-indigo-500">
                                        <span className="absolute -inset-0.5"/>
                                        <span className="sr-only">Open main menu</span>
                                        {open ? (
                                            <XMarkIcon className="block h-6 w-6" aria-hidden="true"/>
                                        ) : (
                                            <Bars3Icon className="block h-6 w-6" aria-hidden="true"/>
                                        )}
                                    </Disclosure.Button>
                                </div>
                                <div className="flex flex-shrink-0 items-center">
                                    <h1 className="text-slate-700 font-bold text-lg">[APOLLO]</h1>
                                </div>
                                <div className="hidden md:ml-6 md:flex md:space-x-8">
                                    {/* Current: "border-indigo-500 text-gray-900", Default: "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700" */}
                                    <NavLink
                                        to="/"
                                        className="inline-flex items-center border-b-2 border-indigo-500 px-1 pt-1 text-sm font-medium text-gray-900"
                                    >
                                        Home
                                    </NavLink>
                                </div>
                            </div>
                            <div className="flex items-center">
                                {auth.isLoggedIn ? (<UserMenu/>) : (<GetStarted/>)}
                            </div>
                        </div>
                    </div>

                    <Disclosure.Panel className="md:hidden">
                        <div className="space-y-1 pb-3 pt-2">
                            {/* Current: "bg-indigo-50 border-indigo-500 text-indigo-700", Default: "border-transparent text-gray-500 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-700" */}
                            <Disclosure.Button
                                as="a"
                                href="/"
                                className="block border-l-4 border-indigo-500 bg-indigo-50 py-2 pl-3 pr-4 text-base font-medium text-indigo-700 sm:pl-5 sm:pr-6"
                            >
                                Home
                            </Disclosure.Button>
                        </div>
                        <div className="border-t border-gray-200 pb-3 pt-4">
                            <div className="flex items-center px-4 sm:px-6">
                                <div className="flex-shrink-0">
                                    <span className="h-10 w-10 rounded-lg">
                                        <svg className="h-10 w-10 text-gray-300" fill="currentColor"
                                             viewBox="0 0 24 24">
                                            <path
                                                d="M24 20.993V24H0v-2.996A14.977 14.977 0 0112.004 15c4.904 0 9.26 2.354 11.996 5.993zM16.002 8.999a4 4 0 11-8 0 4 4 0 018 0z"/>
                                        </svg>
                                    </span>
                                </div>
                                <div className="ml-3">
                                    <div className="text-base font-medium text-gray-800">Fullname</div>
                                    <div className="text-sm font-medium text-gray-500">sam@example.com</div>
                                </div>
                                <button
                                    type="button"
                                    className="relative ml-auto flex-shrink-0 rounded-full bg-white p-1 text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                                >
                                    <span className="absolute -inset-1.5"/>
                                    <span className="sr-only">View notifications</span>
                                    <BellIcon className="h-6 w-6" aria-hidden="true"/>
                                </button>
                            </div>
                            <div className="mt-3 space-y-1">
                                <Disclosure.Button
                                    as="a"
                                    href="#"
                                    className="block px-4 py-2 text-base font-medium text-gray-500 hover:bg-gray-100 hover:text-gray-800 sm:px-6"
                                >
                                    Your Profile
                                </Disclosure.Button>
                                <Disclosure.Button
                                    as="a"
                                    href="#"
                                    className="block px-4 py-2 text-base font-medium text-gray-500 hover:bg-gray-100 hover:text-gray-800 sm:px-6"
                                >
                                    Settings
                                </Disclosure.Button>
                                <Disclosure.Button
                                    as="a"
                                    href="#"
                                    className="block px-4 py-2 text-base font-medium text-gray-500 hover:bg-gray-100 hover:text-gray-800 sm:px-6"
                                >
                                    Sign out
                                </Disclosure.Button>
                            </div>
                        </div>
                    </Disclosure.Panel>
                </>
            )}
        </Disclosure>
    )
}

export default MainNavigation
