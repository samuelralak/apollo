import { NavLink } from "react-router";
import { HugeiconsIcon } from "@hugeicons/react";
import type { IconSvgElement } from "@hugeicons/react";
import { classNames } from "../../../../utils";

export interface NavItemConfig {
    name: string;
    href: string;
    icon: IconSvgElement;
    iconSolid: IconSvgElement;
    requiresAuth?: boolean;
    badge?: number;
    isAction?: boolean;
    onClick?: () => void;
}

interface SidebarNavItemProps {
    item: NavItemConfig;
}

const SidebarNavItem = ({ item }: SidebarNavItemProps) => {
    const baseClasses = classNames(
        "flex items-center justify-center lg:justify-start",
        "w-12 h-12 lg:w-full lg:h-auto lg:gap-3 lg:px-3 lg:py-2.5",
        "rounded-full lg:rounded-lg",
        "transition-colors"
    );

    if (item.isAction && item.onClick) {
        return (
            <button
                type="button"
                onClick={item.onClick}
                className={classNames(
                    baseClasses,
                    "text-slate-700 dark:text-slate-300",
                    "hover:bg-slate-100 dark:hover:bg-slate-900"
                )}
            >
                <HugeiconsIcon icon={item.icon} size={22} className="shrink-0" />
                <span className="hidden lg:block text-sm font-medium">{item.name}</span>
            </button>
        );
    }

    return (
        <NavLink
            to={item.href}
            className={({ isActive }) => classNames(
                baseClasses,
                isActive
                    ? "bg-slate-100 dark:bg-slate-900 text-slate-900 dark:text-white font-semibold"
                    : "text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-900"
            )}
        >
            {({ isActive }) => (
                <>
                    <div className="relative shrink-0">
                        <HugeiconsIcon
                            icon={isActive ? item.iconSolid : item.icon}
                            size={22}
                        />
                        {item.badge !== undefined && item.badge > 0 && (
                            <span className="absolute -top-1 -right-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-teal-500 px-1 text-[10px] font-bold text-white">
                                {item.badge > 99 ? '99+' : item.badge}
                            </span>
                        )}
                    </div>
                    <span className="hidden lg:block text-sm">{item.name}</span>
                </>
            )}
        </NavLink>
    );
};

export default SidebarNavItem;
