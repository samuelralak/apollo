import { HugeiconsIcon } from "@hugeicons/react";
import { UserCircleIcon, Logout01Icon, MoreHorizontalIcon } from "@hugeicons-pro/core-duotone-rounded";
import { Menu, MenuButton, MenuItems, MenuItem } from "@headlessui/react";
import { useDispatch } from "react-redux";
import type { AppDispatch } from "../../../../app/store";
import type { AuthState } from "../../../../domains/auth/store/auth.slice";
import { signOut } from "../../../../domains/auth/store/auth.slice";
import { showPortal, PortalID } from "../../../store/portal.slice";
import { ThemeToggle } from "../../../theme";
import { classNames, getDisplayName } from "../../../../utils";

interface SidebarUserMenuProps {
    auth: AuthState;
}

const SidebarUserMenu = ({ auth }: SidebarUserMenuProps) => {
    const dispatch = useDispatch<AppDispatch>();

    const handleSignOut = () => {
        dispatch(signOut());
    };

    return (
        <Menu as="div" className="relative">
            <MenuButton
                className={classNames(
                    "flex items-center justify-center lg:justify-start gap-3 w-full",
                    "p-2 rounded-full lg:rounded-lg",
                    "hover:bg-slate-100 dark:hover:bg-slate-900",
                    "transition-colors"
                )}
            >
                {auth.userProfile?.image || auth.userProfile?.picture ? (
                    <img
                        src={auth.userProfile.image ?? auth.userProfile.picture}
                        alt=""
                        className="w-9 h-9 rounded-full object-cover"
                    />
                ) : (
                    <span className="w-9 h-9 rounded-full flex items-center justify-center bg-slate-200 dark:bg-slate-800">
                        <HugeiconsIcon icon={UserCircleIcon} size={20} className="text-slate-500" />
                    </span>
                )}
                <div className="hidden lg:flex lg:flex-col lg:items-start lg:flex-1 min-w-0">
                    <span className="text-sm font-medium text-slate-900 dark:text-white truncate max-w-[130px]">
                        {getDisplayName(auth.userProfile, auth.pubkey)}
                    </span>
                    {auth.userProfile?.nip05 && (
                        <span className="text-xs text-slate-500 truncate max-w-[130px]">
                            {auth.userProfile.nip05}
                        </span>
                    )}
                </div>
                <HugeiconsIcon
                    icon={MoreHorizontalIcon}
                    size={18}
                    className="hidden lg:block text-slate-500"
                />
            </MenuButton>

            <MenuItems
                transition
                className={classNames(
                    "absolute bottom-full left-0 mb-2 w-56",
                    "rounded-xl bg-white dark:bg-slate-900",
                    "shadow-lg ring-1 ring-slate-200 dark:ring-slate-800",
                    "focus:outline-none",
                    "transition duration-100 ease-out",
                    "data-[closed]:opacity-0 data-[closed]:scale-95"
                )}
            >
                <div className="px-4 py-3 border-b border-slate-100 dark:border-slate-800">
                    <p className="text-sm font-medium text-slate-900 dark:text-white truncate">
                        {getDisplayName(auth.userProfile, auth.pubkey)}
                    </p>
                    {auth.userProfile?.nip05 && (
                        <p className="text-xs text-slate-500 truncate mt-0.5">
                            {auth.userProfile.nip05}
                        </p>
                    )}
                </div>

                <div className="px-4 py-3 border-b border-slate-100 dark:border-slate-800">
                    <div className="flex items-center justify-between">
                        <span className="text-sm text-slate-600 dark:text-slate-400">Theme</span>
                        <ThemeToggle />
                    </div>
                </div>

                <div className="py-1">
                    <MenuItem>
                        {({ focus }) => (
                            <button
                                type="button"
                                onClick={handleSignOut}
                                className={classNames(
                                    "flex items-center gap-3 w-full px-4 py-2 text-sm",
                                    "text-slate-700 dark:text-slate-300",
                                    focus ? "bg-slate-50 dark:bg-slate-800" : ""
                                )}
                            >
                                <HugeiconsIcon icon={Logout01Icon} size={18} className="text-slate-500" />
                                Sign out
                            </button>
                        )}
                    </MenuItem>
                </div>
            </MenuItems>
        </Menu>
    );
};

export const SidebarGetStarted = () => {
    const dispatch = useDispatch<AppDispatch>();

    const handleGetStarted = () => {
        dispatch(showPortal({ portalId: PortalID.auth }));
    };

    return (
        <button
            type="button"
            onClick={handleGetStarted}
            className={classNames(
                "flex items-center justify-center gap-2",
                "w-12 h-12 lg:w-full lg:h-auto lg:py-2.5",
                "rounded-full lg:rounded-lg",
                "bg-slate-100 dark:bg-slate-900",
                "hover:bg-slate-200 dark:hover:bg-slate-800",
                "text-sm text-slate-700 dark:text-slate-300 font-medium",
                "transition-colors"
            )}
        >
            <HugeiconsIcon icon={UserCircleIcon} size={20} className="lg:hidden" />
            <span className="hidden lg:inline">Sign in</span>
        </button>
    );
};

export default SidebarUserMenu;
