import { useSelector } from "react-redux";
import type { RootState } from "../../../app/store";
import { classNames } from "../../../utils";
import useNotificationBadge from "../../../domains/notification/hooks/useNotificationBadge";

// Duotone icons (inactive state)
import {
    Home09Icon,
    Notification03Icon,
    Bookmark02Icon,
    AtIcon,
    UserCircleIcon,
    Settings01Icon,
} from "@hugeicons-pro/core-duotone-rounded";

// Solid icons (active state)
import {
    Home09Icon as Home09SolidIcon,
    Notification03Icon as Notification03SolidIcon,
    Bookmark02Icon as Bookmark02SolidIcon,
    AtIcon as AtSolidIcon,
    UserCircleIcon as UserCircleSolidIcon,
    Settings01Icon as Settings01SolidIcon,
} from "@hugeicons-pro/core-solid-rounded";

import {
    SidebarLogo,
    SidebarNavItem,
    SidebarCTA,
    SidebarUserMenu,
    SidebarGetStarted,
} from "./sidebar/index";
import type { NavItemConfig } from "./sidebar/index";

interface SidebarProps {
    className?: string;
}

const Sidebar = ({ className }: SidebarProps) => {
    const auth = useSelector((state: RootState) => state.auth);
    const { unreadCount, showNotifications } = useNotificationBadge();

    const navItems: NavItemConfig[] = [
        {
            name: 'Home',
            href: '/',
            icon: Home09Icon,
            iconSolid: Home09SolidIcon,
        },
    ];

    if (auth.isLoggedIn) {
        if (showNotifications) {
            navItems.push({
                name: 'Notifications',
                href: '/notifications',
                icon: Notification03Icon,
                iconSolid: Notification03SolidIcon,
                badge: unreadCount,
            });
        }

        navItems.push(
            {
                name: 'Bookmarks',
                href: '/bookmarks',
                icon: Bookmark02Icon,
                iconSolid: Bookmark02SolidIcon,
            },
            {
                name: 'Invites',
                href: '/invites',
                icon: AtIcon,
                iconSolid: AtSolidIcon,
            },
            {
                name: 'Profile',
                href: `/user/${auth.pubkey}`,
                icon: UserCircleIcon,
                iconSolid: UserCircleSolidIcon,
            },
            {
                name: 'Settings',
                href: '/settings/user-profile',
                icon: Settings01Icon,
                iconSolid: Settings01SolidIcon,
            }
        );
    }

    return (
        <aside
            className={classNames(
                "sticky top-0 h-screen z-40",
                "w-[68px] lg:w-[260px] shrink-0",
                "flex flex-col",
                "bg-white dark:bg-slate-950",
                className
            )}
        >
            <SidebarLogo />

            <nav className="px-2 lg:px-3 space-y-0.5">
                {navItems.map((item) => (
                    <SidebarNavItem key={item.name} item={item} />
                ))}
            </nav>

            {auth.isLoggedIn && <SidebarCTA />}

            {/* Spacer to push user menu to bottom */}
            <div className="flex-1" />

            <div className="p-2 lg:p-3">
                {auth.isLoggedIn ? (
                    <SidebarUserMenu auth={auth} />
                ) : (
                    <SidebarGetStarted />
                )}
            </div>
        </aside>
    );
};

export default Sidebar;
