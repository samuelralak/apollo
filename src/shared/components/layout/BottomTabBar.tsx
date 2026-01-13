import { NavLink } from "react-router";
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
    Menu02Icon,
} from "@hugeicons-pro/core-duotone-rounded";

// Solid icons (active state)
import {
    Home09Icon as Home09SolidIcon,
    Search01Icon as Search01SolidIcon,
    Notification03Icon as Notification03SolidIcon,
    Menu02Icon as Menu02SolidIcon,
} from "@hugeicons-pro/core-solid-rounded";

interface TabItem {
    name: string;
    href?: string;
    icon: IconSvgElement;
    iconSolid: IconSvgElement;
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

    const openAuth = () => dispatch(showPortal({ portalId: PortalID.auth }));
    const openSearch = () => dispatch(showPortal({ portalId: PortalID.search }));
    const openMenu = () => dispatch(showPortal({ portalId: PortalID.mobileMenu }));

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
            name: 'Notifications',
            href: auth.isLoggedIn ? '/notifications' : undefined,
            icon: Notification03Icon,
            iconSolid: Notification03SolidIcon,
            badge: showNotifications ? unreadCount : undefined,
            isAction: !auth.isLoggedIn,
            onClick: !auth.isLoggedIn ? openAuth : undefined,
        },
        {
            name: 'More',
            icon: Menu02Icon,
            iconSolid: Menu02SolidIcon,
            isAction: true,
            onClick: openMenu,
        },
    ];

    return (
        <nav
            className={classNames(
                "fixed bottom-0 left-0 right-0 z-40",
                "flex items-center justify-around",
                "h-16 bg-white dark:bg-slate-950",
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
    if (tab.isAction) {
        return (
            <button
                type="button"
                onClick={tab.onClick}
                className="flex flex-col items-center justify-center gap-0.5 flex-1 h-full text-slate-500 dark:text-slate-400 active:text-slate-700 dark:active:text-slate-200 transition-colors"
            >
                <div className="relative">
                    <HugeiconsIcon icon={tab.icon} size={24} />
                    {tab.badge !== undefined && tab.badge > 0 && (
                        <span className="absolute -top-1 -right-2 flex h-4 min-w-4 items-center justify-center rounded-full bg-teal-500 px-1 text-[10px] font-bold text-white">
                            {tab.badge > 99 ? '99+' : tab.badge}
                        </span>
                    )}
                </div>
                <span className="text-[11px] font-medium">{tab.name}</span>
            </button>
        );
    }

    return (
        <NavLink
            to={tab.href!}
            className={({ isActive }) => classNames(
                "flex flex-col items-center justify-center gap-0.5 flex-1 h-full transition-colors",
                isActive ? "text-slate-900 dark:text-white" : "text-slate-500 dark:text-slate-400"
            )}
        >
            {({ isActive }) => (
                <>
                    <div className="relative">
                        <HugeiconsIcon icon={isActive ? tab.iconSolid : tab.icon} size={24} />
                        {tab.badge !== undefined && tab.badge > 0 && (
                            <span className="absolute -top-1 -right-2 flex h-4 min-w-4 items-center justify-center rounded-full bg-teal-500 px-1 text-[10px] font-bold text-white">
                                {tab.badge > 99 ? '99+' : tab.badge}
                            </span>
                        )}
                    </div>
                    <span className="text-[11px] font-medium">{tab.name}</span>
                </>
            )}
        </NavLink>
    );
};

export default BottomTabBar;
