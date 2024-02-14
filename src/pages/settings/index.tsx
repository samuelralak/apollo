import {BellIcon, CursorArrowRaysIcon, FingerPrintIcon, GlobeAltIcon, UserCircleIcon} from '@heroicons/react/24/outline'
import {classNames} from "../../utils";
import UserProfileSettingsPage from "./user-profile";
import NetworkSettingsPage from "./network";
import NotificationsSettingsPage from "./notifications";
import SecuritySettingsPage from "./security";
import TranslationSettingsPage from "./translation";
import {NavLink, Outlet} from "react-router-dom";

const secondaryNavigation = [
    {name: 'General', href: '/settings/user-profile', icon: UserCircleIcon, current: true},
    {name: 'Security', href: '/settings/security', icon: FingerPrintIcon, current: false},
    {name: 'Notifications', href: '/settings/notifications', icon: BellIcon, current: false},
    {name: 'Network', href: '/settings/network', icon: CursorArrowRaysIcon, current: false},
    {name: 'Translation', href: '/settings/translation', icon: GlobeAltIcon, current: false},
]

const SettingsPage = () => {
    return (
        <div className="lg:flex lg:gap-x-16 lg:px-8">
            <aside
                className="flex overflow-x-auto border-b border-gray-900/5 lg:block lg:w-64 lg:flex-none lg:border-0">
                <nav className="flex-none px-4 sm:px-6 lg:px-0">
                    <ul role="list" className="flex gap-x-3 gap-y-1 whitespace-nowrap lg:flex-col">
                        {secondaryNavigation.map((item) => (
                            <li key={item.name}>
                                <NavLink
                                    to={item.href}
                                    className={({isActive}) => classNames(
                                        isActive
                                            ? 'bg-slate-50 text-slate-700'
                                            : 'text-slate-400 hover:text-slate-700 hover:bg-slate-50',
                                        'group flex gap-x-3 rounded-md py-2 pl-2 pr-3 text-sm leading-6 font-semibold'
                                    )}
                                >
                                    {({isActive}) => (
                                        <>
                                            <item.icon
                                                className={classNames(
                                                    isActive ? 'text-slate-700' : 'text-slate-400 group-hover:text-slate-700',
                                                    'h-6 w-6 shrink-0'
                                                )}
                                                aria-hidden="true"
                                            />
                                            {item.name}
                                        </>
                                    )}

                                </NavLink>
                            </li>
                        ))}
                    </ul>
                </nav>
            </aside>

            <main className="sm:px-6 lg:flex-auto lg:px-0">
                <Outlet/>
            </main>
        </div>
    )
}

export default SettingsPage

export {
    UserProfileSettingsPage,
    NetworkSettingsPage,
    NotificationsSettingsPage,
    SecuritySettingsPage,
    TranslationSettingsPage
}
