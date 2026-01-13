import { NavLink, Link } from "react-router";
import { useDispatch, useSelector } from "react-redux";
import { HugeiconsIcon } from "@hugeicons/react";
import type { IconSvgElement } from "@hugeicons/react";
import type { AppDispatch, RootState } from "../../../app/store";
import { showPortal, PortalID } from "../../store/portal.slice";
import { classNames } from "../../../utils";
import useNotificationBadge from "../../../domains/notification/hooks/useNotificationBadge";

// Duotone icons (inactive state)
import {
    Home09Icon,
    Search01Icon,
    Notification03Icon,
    UserCircleIcon,
    MessageAdd01Icon,
} from "@hugeicons-pro/core-duotone-rounded";

// Solid icons (active state)
import {
    Home09Icon as Home09SolidIcon,
    Search01Icon as Search01SolidIcon,
    Notification03Icon as Notification03SolidIcon,
    UserCircleIcon as UserCircleSolidIcon,
} from "@hugeicons-pro/core-solid-rounded";

interface TabItem {
    name: string;
    href?: string;
    icon: IconSvgElement;
    iconSolid: IconSvgElement;
    isPrimary?: boolean;
    badge?: number;
    isAction?: boolean;
    onClick?: () => void;
}

interface BottomTabBarProps {
    className?: string;
}

const BottomTabBar = ({ className }: BottomTabBarProps) => {
    const dispatch = useDispatch<AppDispatch>();
    const auth = useSelector((state: RootState) => state.auth);
    const { unreadCount, showNotifications } = useNotificationBadge();

    const openSearch = () => dispatch(showPortal({ portalId: PortalID.search }));
    const openAuth = () => dispatch(showPortal({ portalId: PortalID.auth }));

    const tabs: TabItem[] = [
        {
            name: 'Home',
            href: '/',
            icon: Home09Icon,
            iconSolid: Home09SolidIcon,
        },
        {
            name: 'Search',
            icon: Search01Icon,
            iconSolid: Search01SolidIcon,
            isAction: true,
            onClick: openSearch,
        },
        {
            name: 'Ask',
            href: '/questions/new',
            icon: MessageAdd01Icon,
            iconSolid: MessageAdd01Icon,
            isPrimary: true,
        },
        {
            name: 'Alerts',
            href: auth.isLoggedIn && showNotifications ? '/notifications' : undefined,
            icon: Notification03Icon,
            iconSolid: Notification03SolidIcon,
            badge: auth.isLoggedIn && showNotifications ? unreadCount : undefined,
            isAction: !auth.isLoggedIn || !showNotifications,
            onClick: !auth.isLoggedIn ? openAuth : undefined,
        },
        {
            name: 'Profile',
            href: auth.isLoggedIn ? `/user/${auth.pubkey}` : undefined,
            icon: UserCircleIcon,
            iconSolid: UserCircleSolidIcon,
            isAction: !auth.isLoggedIn,
            onClick: !auth.isLoggedIn ? openAuth : undefined,
        },
    ];

    return (
        <nav
            className={classNames(
                "fixed bottom-0 left-0 right-0 z-40",
                "flex items-center justify-around",
                "h-14 bg-white dark:bg-slate-950",
                "border-t border-slate-200 dark:border-slate-800",
                "safe-area-bottom",
                className
            )}
        >
            {tabs.map((tab) => (
                <TabItem key={tab.name} tab={tab} />
            ))}
        </nav>
    );
};

const TabItem = ({ tab }: { tab: TabItem }) => {
    if (tab.isPrimary) {
        return (
            <Link
                to={tab.href!}
                className="flex items-center justify-center w-10 h-10 -mt-3 rounded-full bg-teal-500 text-white shadow-sm"
            >
                <HugeiconsIcon icon={tab.icon} size={18} />
            </Link>
        );
    }

    if (tab.isAction && tab.onClick) {
        return (
            <button
                type="button"
                onClick={tab.onClick}
                className="flex flex-col items-center justify-center flex-1 h-full text-slate-500 dark:text-slate-400"
            >
                <HugeiconsIcon icon={tab.icon} size={20} />
            </button>
        );
    }

    return (
        <NavLink
            to={tab.href!}
            className={({ isActive }) => classNames(
                "flex flex-col items-center justify-center flex-1 h-full",
                isActive ? "text-slate-900 dark:text-white" : "text-slate-500 dark:text-slate-400"
            )}
        >
            {({ isActive }) => (
                <div className="relative">
                    <HugeiconsIcon icon={isActive ? tab.iconSolid : tab.icon} size={20} />
                    {tab.badge !== undefined && tab.badge > 0 && (
                        <span className="absolute -top-1 -right-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-teal-500 px-1 text-[10px] font-bold text-white">
                            {tab.badge > 99 ? '99+' : tab.badge}
                        </span>
                    )}
                </div>
            )}
        </NavLink>
    );
};

export default BottomTabBar;
