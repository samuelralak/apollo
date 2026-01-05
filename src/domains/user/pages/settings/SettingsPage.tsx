import {HugeiconsIcon} from "@hugeicons/react";
import type {IconSvgElement} from "@hugeicons/react";
import {UserCircleIcon, FingerPrintIcon, Notification03Icon, Cursor02Icon, LanguageSkillIcon, ColorsIcon} from "@hugeicons-pro/core-twotone-rounded";
import {UserCircleIcon as UserCircleSolidIcon, FingerPrintIcon as FingerPrintSolidIcon, Notification03Icon as Notification03SolidIcon, Cursor02Icon as Cursor02SolidIcon, LanguageSkillIcon as LanguageSkillSolidIcon, ColorsIcon as ColorsSolidIcon} from "@hugeicons-pro/core-solid-rounded";
import {classNames} from "../../../../utils";
import {NavLink, Outlet} from "react-router";

const secondaryNavigation: {name: string; href: string; icon: IconSvgElement; iconSolid: IconSvgElement; current: boolean}[] = [
    {name: 'General', href: '/settings/user-profile', icon: UserCircleIcon, iconSolid: UserCircleSolidIcon, current: true},
    {name: 'Security', href: '/settings/security', icon: FingerPrintIcon, iconSolid: FingerPrintSolidIcon, current: false},
    {name: 'Notifications', href: '/settings/notifications', icon: Notification03Icon, iconSolid: Notification03SolidIcon, current: false},
    {name: 'Network', href: '/settings/network', icon: Cursor02Icon, iconSolid: Cursor02SolidIcon, current: false},
    {name: 'Translation', href: '/settings/translation', icon: LanguageSkillIcon, iconSolid: LanguageSkillSolidIcon, current: false},
    {name: 'Appearance', href: '/settings/appearance', icon: ColorsIcon, iconSolid: ColorsSolidIcon, current: false},
]

const SettingsPage = () => {
    return (
        <div className="lg:flex lg:gap-x-16 lg:px-8">
            <aside
                className="flex overflow-x-auto border-b border-slate-200 dark:border-slate-700 lg:block lg:w-64 lg:flex-none lg:border-0">
                <nav className="flex-none px-4 sm:px-6 lg:px-0">
                    <ul role="list" className="flex gap-x-3 gap-y-1 whitespace-nowrap lg:flex-col">
                        {secondaryNavigation.map((item) => (
                            <li key={item.name}>
                                <NavLink
                                    to={item.href}
                                    className={({isActive}) => classNames(
                                        isActive
                                            ? 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200'
                                            : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800',
                                        'group flex gap-x-3 rounded-md py-2 pl-2 pr-3 text-sm leading-6 font-semibold transition-colors'
                                    )}
                                >
                                    {({isActive}) => (
                                        <>
                                            <HugeiconsIcon
                                                icon={isActive ? item.iconSolid : item.icon}
                                                className={classNames(
                                                    isActive ? 'text-slate-700 dark:text-slate-200' : 'text-slate-400 dark:text-slate-500 group-hover:text-slate-700 dark:group-hover:text-slate-200',
                                                    'shrink-0 transition-colors'
                                                )}
                                                size={24}
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
