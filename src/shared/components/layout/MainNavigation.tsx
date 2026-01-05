import {Bars3Icon} from '@heroicons/react/24/outline'
import {NavLink} from "react-router";
import {useDispatch, useSelector} from "react-redux";
import {AppDispatch, RootState} from "../../../app/store";
import UserMenuDesktop from "../../../domains/auth/components/UserMenuDesktop";
import GetStarted from "../../../domains/auth/components/GetStarted";
import {ThemeToggle} from "../../theme";
import {PortalID, showPortal} from "../../store/portal.slice";

const MainNavigation = () => {
    const dispatch = useDispatch<AppDispatch>()
    const auth = useSelector((state: RootState) => state.auth)

    const openMobileMenu = () => dispatch(showPortal({portalId: PortalID.mobileMenu}))

    return (
        <nav className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-700">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                <div className="flex h-16 justify-between">
                    <div className="flex">
                        <div className="-ml-2 mr-2 flex items-center md:hidden">
                            {/* Mobile menu button */}
                            <button
                                type="button"
                                onClick={openMobileMenu}
                                className="relative inline-flex items-center justify-center rounded-md p-2 text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-600 dark:hover:text-slate-300 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-teal-500"
                            >
                                <span className="sr-only">Open main menu</span>
                                <Bars3Icon className="block h-6 w-6" aria-hidden="true"/>
                            </button>
                        </div>
                        <div className="flex shrink-0 items-center">
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
                    <div className="flex items-center gap-x-2 md:gap-x-3">
                        <a
                            href="https://github.com/samuelralak/apollo"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="relative rounded-full p-2 text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                            aria-label="View on GitHub"
                        >
                            <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                                <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd"/>
                            </svg>
                        </a>
                        <div className="hidden md:block">
                            <ThemeToggle />
                        </div>
                        {auth.isLoggedIn ? <UserMenuDesktop auth={auth}/> : <GetStarted />}
                    </div>
                </div>
            </div>
        </nav>
    )
}

export default MainNavigation
