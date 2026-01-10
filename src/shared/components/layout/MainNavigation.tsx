import {HugeiconsIcon} from "@hugeicons/react";
import {Menu01Icon, Github01Icon} from "@hugeicons-pro/core-duotone-rounded";
import {Search01Icon} from "@hugeicons-pro/core-twotone-rounded";
import {CommandIcon} from "@hugeicons-pro/core-solid-rounded";
import {NavLink} from "react-router";
import {useDispatch, useSelector} from "react-redux";
import {AppDispatch, RootState} from "../../../app/store";
import UserMenuDesktop from "../../../domains/auth/components/UserMenuDesktop";
import GetStarted from "../../../domains/auth/components/GetStarted";
import {ThemeToggle} from "../../theme";
import {PortalID, showPortal} from "../../store/portal.slice";
import {useMemo} from "react";

const MainNavigation = () => {
    const dispatch = useDispatch<AppDispatch>()
    const auth = useSelector((state: RootState) => state.auth)

    const openMobileMenu = () => dispatch(showPortal({portalId: PortalID.mobileMenu}))
    const openSearch = () => dispatch(showPortal({portalId: PortalID.search}))

    // Detect Mac for keyboard shortcut display
    const isMac = useMemo(() => typeof navigator !== 'undefined' && navigator.platform.toUpperCase().indexOf('MAC') >= 0, [])

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
                                <HugeiconsIcon icon={Menu01Icon} size={24} />
                            </button>
                        </div>
                        <div className="flex shrink-0 items-center">
                            <h1 className="text-slate-700 dark:text-slate-200 font-extrabold font-['Poppins'] text-lg">[APOLLO]</h1>
                        </div>
                        <div className="hidden md:ml-6 md:flex md:space-x-8">
                            <NavLink
                                to="/"
                                end
                                className={({isActive}) =>
                                    `inline-flex items-center border-b-2 px-1 pt-1 text-sm font-medium ${
                                        isActive
                                            ? 'border-teal-600 dark:border-teal-500 text-slate-900 dark:text-slate-100'
                                            : 'border-transparent text-slate-500 dark:text-slate-400 hover:border-slate-300 dark:hover:border-slate-600 hover:text-slate-700 dark:hover:text-slate-300'
                                    }`
                                }
                            >
                                Home
                            </NavLink>
                            <NavLink
                                to="/about"
                                className={({isActive}) =>
                                    `inline-flex items-center border-b-2 px-1 pt-1 text-sm font-medium ${
                                        isActive
                                            ? 'border-teal-600 dark:border-teal-500 text-slate-900 dark:text-slate-100'
                                            : 'border-transparent text-slate-500 dark:text-slate-400 hover:border-slate-300 dark:hover:border-slate-600 hover:text-slate-700 dark:hover:text-slate-300'
                                    }`
                                }
                            >
                                About
                            </NavLink>
                        </div>
                    </div>
                    <div className="flex items-center gap-x-2 md:gap-x-3">
                        {/* Search button - Desktop */}
                        <button
                            type="button"
                            onClick={openSearch}
                            className="hidden md:flex items-center gap-3 w-56 lg:w-64 px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 text-slate-400 dark:text-slate-500 hover:border-slate-300 dark:hover:border-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                        >
                            <HugeiconsIcon icon={Search01Icon} size={16} />
                            <span className="flex-1 text-sm text-left">Search...</span>
                            <span className="flex items-center gap-0.5 text-slate-500 dark:text-slate-400">
                                {isMac ? (
                                    <HugeiconsIcon icon={CommandIcon} size={14} />
                                ) : (
                                    <span className="text-xs font-medium">Ctrl</span>
                                )}
                                <span className="text-sm font-semibold">K</span>
                            </span>
                        </button>

                        {/* Search button - Mobile */}
                        <button
                            type="button"
                            onClick={openSearch}
                            className="md:hidden p-2 rounded-lg text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                            aria-label="Search"
                        >
                            <HugeiconsIcon icon={Search01Icon} size={20} />
                        </button>

                        <a
                            href="https://github.com/samuelralak/apollo"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="relative rounded-full p-2 text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                            aria-label="View on GitHub"
                        >
                            <HugeiconsIcon icon={Github01Icon} size={22} />
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
