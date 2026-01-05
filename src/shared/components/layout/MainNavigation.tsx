import {Disclosure, DisclosureButton, DisclosurePanel} from '@headlessui/react'
import {Bars3Icon, XMarkIcon} from '@heroicons/react/24/outline'
import {NavLink} from "react-router";
import {useSelector} from "react-redux";
import {RootState} from "../../../app/store";
import UserMenuDesktop from "../../../domains/auth/components/UserMenuDesktop";
import GetStarted from "../../../domains/auth/components/GetStarted";
import UserMenuMobile from "../../../domains/auth/components/UserMenuMobile";
import {ThemeToggle} from "../../theme";

const MainNavigation = () => {
    const auth = useSelector((state: RootState) => state.auth)

    return (
        <Disclosure as="nav" className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-700">
            {({open}) => (
                <>
                    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                        <div className="flex h-16 justify-between">
                            <div className="flex">
                                <div className="-ml-2 mr-2 flex items-center md:hidden">
                                    {/* Mobile menu button */}
                                    <DisclosureButton
                                        className="relative inline-flex items-center justify-center rounded-md p-2 text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-600 dark:hover:text-slate-300 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-teal-500">
                                        <span className="absolute -inset-0.5"/>
                                        <span className="sr-only">Open main menu</span>
                                        {open ? (
                                            <XMarkIcon className="block h-6 w-6" aria-hidden="true"/>
                                        ) : (
                                            <Bars3Icon className="block h-6 w-6" aria-hidden="true"/>
                                        )}
                                    </DisclosureButton>
                                </div>
                                <div className="flex flex-shrink-0 items-center">
                                    <h1 className="text-slate-700 dark:text-slate-200 font-extrabold font-['Poppins'] text-lg">[APOLLO]</h1>
                                </div>
                                <div className="hidden md:ml-6 md:flex md:space-x-8">
                                    <NavLink
                                        to="/"
                                        className="inline-flex items-center border-b-2 border-teal-600 dark:border-teal-500 px-1 pt-1 text-sm font-medium text-slate-900 dark:text-slate-100"
                                    >
                                        Home
                                    </NavLink>
                                </div>
                            </div>
                            <div className="flex items-center gap-x-2">
                                <ThemeToggle />
                                {auth.isLoggedIn ? (<UserMenuDesktop auth={auth}/>) : (<GetStarted />)}
                            </div>
                        </div>
                    </div>

                    <DisclosurePanel className="md:hidden">
                        <div className="space-y-1 pb-3 pt-2">
                            <DisclosureButton
                                as="a"
                                href="/"
                                className="block border-l-4 border-teal-600 dark:border-teal-500 bg-teal-50 dark:bg-teal-950 py-2 pl-3 pr-4 text-base font-medium text-teal-700 dark:text-teal-300 sm:pl-5 sm:pr-6"
                            >
                                Home
                            </DisclosureButton>
                        </div>
                        {auth.isLoggedIn && (<UserMenuMobile auth={auth}/>)}
                    </DisclosurePanel>
                </>
            )}
        </Disclosure>
    )
}

export default MainNavigation
