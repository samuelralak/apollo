import {
    BellIcon,
    GlobeAltIcon,
    FingerPrintIcon,
    UserCircleIcon,
    CursorArrowRaysIcon
} from '@heroicons/react/24/outline'
import {classNames} from "../../utils";
import UserProfileSettingsPage from "./user-profile";
import {Outlet} from "react-router-dom";

const secondaryNavigation = [
    {name: 'General', href: '#', icon: UserCircleIcon, current: true},
    {name: 'Security', href: '#', icon: FingerPrintIcon, current: false},
    {name: 'Notifications', href: '#', icon: BellIcon, current: false},
    {name: 'Network', href: '#', icon: CursorArrowRaysIcon, current: false},
    {name: 'Translation', href: '#', icon: GlobeAltIcon, current: false},
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
                                <a
                                    href={item.href}
                                    className={classNames(
                                        item.current
                                            ? 'bg-gray-50 text-indigo-600'
                                            : 'text-gray-700 hover:text-indigo-600 hover:bg-gray-50',
                                        'group flex gap-x-3 rounded-md py-2 pl-2 pr-3 text-sm leading-6 font-semibold'
                                    )}
                                >
                                    <item.icon
                                        className={classNames(
                                            item.current ? 'text-indigo-600' : 'text-gray-400 group-hover:text-indigo-600',
                                            'h-6 w-6 shrink-0'
                                        )}
                                        aria-hidden="true"
                                    />
                                    {item.name}
                                </a>
                            </li>
                        ))}
                    </ul>
                </nav>
            </aside>

            <main className="sm:px-6 lg:flex-auto lg:px-0">
                <Outlet />
            </main>
        </div>
    )
}

export default SettingsPage

export {
    UserProfileSettingsPage
}
