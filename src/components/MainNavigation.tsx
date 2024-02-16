import {Disclosure} from '@headlessui/react'
import {Bars3Icon, XMarkIcon} from '@heroicons/react/24/outline'
import {NavLink} from "react-router-dom";
import {useSelector} from "react-redux";
import {RootState} from "../store";
import UserMenuDesktop from "./navigation/UserMenuDesktop.tsx";
import GetStarted from "./navigation/GetStarted.tsx";
import UserMenuMobile from "./navigation/UserMenuMobile.tsx";

const MainNavigation = () => {
    const auth = useSelector((state: RootState) => state.auth)

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
                                        className="relative inline-flex items-center justify-center rounded-md p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500">
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
                                    <h1 className="text-slate-700 font-extrabold font-['Poppins'] text-lg">[APOLLO]</h1>
                                </div>
                                <div className="hidden md:ml-6 md:flex md:space-x-8">
                                    {/* Current: "border-slate-700text-gray-900", Default: "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700" */}
                                    <NavLink
                                        to="/"
                                        className="inline-flex items-center border-b-2 border-slate-700px-1 pt-1 text-sm font-medium text-gray-900"
                                    >
                                        Home
                                    </NavLink>
                                </div>
                            </div>
                            <div className="flex items-center">
                                {auth.isLoggedIn ? (<UserMenuDesktop auth={auth}/>) : (<GetStarted />)}
                            </div>
                        </div>
                    </div>

                    <Disclosure.Panel className="md:hidden">
                        <div className="space-y-1 pb-3 pt-2">
                            {/* Current: "bg-blue-50 border-slate-700text-blue-700", Default: "border-transparent text-gray-500 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-700" */}
                            <Disclosure.Button
                                as="a"
                                href="/"
                                className="block border-l-4 border-slate-700bg-blue-50 py-2 pl-3 pr-4 text-base font-medium text-blue-700 sm:pl-5 sm:pr-6"
                            >
                                Home
                            </Disclosure.Button>
                        </div>
                        {auth.isLoggedIn && (<UserMenuMobile auth={auth}/>)}
                    </Disclosure.Panel>
                </>
            )}
        </Disclosure>
    )
}

export default MainNavigation
