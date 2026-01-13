import {HugeiconsIcon} from "@hugeicons/react";
import type {IconSvgElement} from "@hugeicons/react";
import {UserCircleIcon, FingerPrintIcon, Notification03Icon, Cursor02Icon, LanguageSkillIcon, ColorsIcon} from "@hugeicons-pro/core-twotone-rounded";
import {UserCircleIcon as UserCircleSolidIcon, FingerPrintIcon as FingerPrintSolidIcon, Notification03Icon as Notification03SolidIcon, Cursor02Icon as Cursor02SolidIcon, LanguageSkillIcon as LanguageSkillSolidIcon, ColorsIcon as ColorsSolidIcon} from "@hugeicons-pro/core-solid-rounded";
import {classNames} from "../../../../utils";
import {NavLink, Outlet} from "react-router";

const secondaryNavigation: {name: string; href: string; icon: IconSvgElement; iconSolid: IconSvgElement}[] = [
    {name: 'General', href: '/settings/user-profile', icon: UserCircleIcon, iconSolid: UserCircleSolidIcon},
    {name: 'Security', href: '/settings/security', icon: FingerPrintIcon, iconSolid: FingerPrintSolidIcon},
    {name: 'Notifications', href: '/settings/notifications', icon: Notification03Icon, iconSolid: Notification03SolidIcon},
    {name: 'Network', href: '/settings/network', icon: Cursor02Icon, iconSolid: Cursor02SolidIcon},
    {name: 'Translation', href: '/settings/translation', icon: LanguageSkillIcon, iconSolid: LanguageSkillSolidIcon},
    {name: 'Appearance', href: '/settings/appearance', icon: ColorsIcon, iconSolid: ColorsSolidIcon},
]

const SettingsPage = () => {
    return (
        <div className="space-y-6">
            {/* Page Title */}
            <h1 className="text-xl font-semibold text-slate-900 dark:text-slate-100">Settings</h1>

            {/* Navigation Tabs */}
            <nav className="border-b border-slate-200 dark:border-slate-700 overflow-x-auto scrollbar-hide">
                <ul role="list" className="flex gap-x-1 whitespace-nowrap">
                    {secondaryNavigation.map((item) => (
                        <li key={item.name}>
                            <NavLink
                                to={item.href}
                                className={({isActive}) => classNames(
                                    isActive
                                        ? 'border-teal-500 text-slate-900 dark:text-slate-100'
                                        : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300 hover:border-slate-300 dark:hover:border-slate-600',
                                    'flex items-center gap-2 border-b-2 px-3 py-2.5 text-sm font-medium transition-colors'
                                )}
                            >
                                {({isActive}) => (
                                    <>
                                        <HugeiconsIcon
                                            icon={isActive ? item.iconSolid : item.icon}
                                            className="shrink-0"
                                            size={18}
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

            {/* Content */}
            <main>
                <Outlet/>
            </main>
        </div>
    )
}

export default SettingsPage
