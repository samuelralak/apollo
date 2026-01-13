import { Dialog, DialogBackdrop, DialogPanel } from "@headlessui/react";
import { HugeiconsIcon } from "@hugeicons/react";
import {
    Search01Icon,
    UserCircleIcon,
    Bookmark02Icon,
    AtIcon,
    InformationCircleIcon,
    FileValidationIcon,
    SecurityLockIcon,
    Github01Icon,
    Logout01Icon,
    CopyrightIcon,
    BitcoinEllipseIcon,
    FlashIcon,
    Cancel01Icon
} from "@hugeicons-pro/core-twotone-rounded";
import { Link } from "react-router";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "../../../app/store";
import { hidePortal, showPortal, PortalID } from "../../store/portal.slice";
import { signOut } from "../../../domains/auth/store/auth.slice";
import { ThemeToggle } from "../../theme";

const MobileMenuPortal = () => {
    const dispatch = useDispatch<AppDispatch>();
    const visible = useSelector((state: RootState) => state.portal.visible);
    const auth = useSelector((state: RootState) => state.auth);
    const currentYear = new Date().getFullYear();

    const handleClose = () => dispatch(hidePortal());

    const handleSignOut = () => {
        dispatch(signOut());
        handleClose();
    };

    const openSearch = () => {
        dispatch(hidePortal());
        setTimeout(() => {
            dispatch(showPortal({ portalId: PortalID.search }));
        }, 100);
    };

    const menuItemClass = "flex items-center gap-3 px-4 py-3 text-base font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700/50 active:bg-slate-100 dark:active:bg-slate-700 transition-colors";
    const secondaryItemClass = "flex items-center gap-3 px-4 py-2.5 text-sm text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700/50 active:bg-slate-100 dark:active:bg-slate-700 transition-colors";

    return (
        <Dialog open={visible} onClose={handleClose} className="relative z-50 md:hidden">
            <DialogBackdrop
                transition
                className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity duration-300 ease-out data-closed:opacity-0"
            />

            <div className="fixed inset-0 flex items-end">
                <DialogPanel
                    transition
                    className="w-full max-h-[85vh] rounded-t-2xl bg-white dark:bg-slate-900 shadow-2xl overflow-hidden transition-all duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] data-closed:translate-y-full"
                >
                    {/* Header */}
                    <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100 dark:border-slate-800">
                        <span className="text-lg font-semibold text-slate-900 dark:text-slate-100">Menu</span>
                        <button
                            type="button"
                            onClick={handleClose}
                            className="p-2 -mr-2 rounded-lg text-slate-400 hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                        >
                            <HugeiconsIcon icon={Cancel01Icon} size={20} />
                        </button>
                    </div>

                    {/* Scrollable content */}
                    <div className="overflow-y-auto max-h-[calc(85vh-60px)]">
                        {/* Search */}
                        <button type="button" onClick={openSearch} className={`${menuItemClass} w-full`}>
                            <HugeiconsIcon icon={Search01Icon} size={20} className="text-slate-400 dark:text-slate-500" />
                            Search
                        </button>

                        {/* Auth-required items */}
                        {auth.isLoggedIn && (
                            <>
                                <Link to={`/user/${auth.pubkey}`} onClick={handleClose} className={menuItemClass}>
                                    <HugeiconsIcon icon={UserCircleIcon} size={20} className="text-slate-400 dark:text-slate-500" />
                                    Profile
                                </Link>
                                <Link to="/bookmarks" onClick={handleClose} className={menuItemClass}>
                                    <HugeiconsIcon icon={Bookmark02Icon} size={20} className="text-slate-400 dark:text-slate-500" />
                                    Bookmarks
                                </Link>
                                <Link to="/invites" onClick={handleClose} className={menuItemClass}>
                                    <HugeiconsIcon icon={AtIcon} size={20} className="text-slate-400 dark:text-slate-500" />
                                    Invites
                                </Link>
                            </>
                        )}

                        <div className="border-t border-slate-100 dark:border-slate-800 my-1" />

                        {/* Info links */}
                        <Link to="/about" onClick={handleClose} className={secondaryItemClass}>
                            <HugeiconsIcon icon={InformationCircleIcon} size={18} className="text-slate-400 dark:text-slate-500" />
                            About
                        </Link>
                        <Link to="/terms" onClick={handleClose} className={secondaryItemClass}>
                            <HugeiconsIcon icon={FileValidationIcon} size={18} className="text-slate-400 dark:text-slate-500" />
                            Terms of Service
                        </Link>
                        <Link to="/privacy" onClick={handleClose} className={secondaryItemClass}>
                            <HugeiconsIcon icon={SecurityLockIcon} size={18} className="text-slate-400 dark:text-slate-500" />
                            Privacy Policy
                        </Link>
                        <a
                            href="https://github.com/samuelralak/apollo"
                            target="_blank"
                            rel="noopener noreferrer"
                            className={secondaryItemClass}
                        >
                            <HugeiconsIcon icon={Github01Icon} size={18} className="text-slate-400 dark:text-slate-500" />
                            GitHub
                        </a>

                        <div className="border-t border-slate-100 dark:border-slate-800 my-1" />

                        {/* Theme */}
                        <div className="flex items-center justify-between px-4 py-3">
                            <span className="text-base font-medium text-slate-700 dark:text-slate-200">Appearance</span>
                            <ThemeToggle />
                        </div>

                        {/* Sign out */}
                        {auth.isLoggedIn && (
                            <>
                                <div className="border-t border-slate-100 dark:border-slate-800 my-1" />
                                <button type="button" onClick={handleSignOut} className={`${menuItemClass} w-full text-red-600 dark:text-red-400`}>
                                    <HugeiconsIcon icon={Logout01Icon} size={20} className="text-red-500 dark:text-red-400" />
                                    Sign out
                                </button>
                            </>
                        )}

                        {/* Footer */}
                        <div className="border-t border-slate-100 dark:border-slate-800 mt-1" />
                        <div className="px-4 py-4 text-xs text-slate-400 dark:text-slate-500">
                            <p className="mb-2">
                                Open source under AGPL-3.0. Built on The Bitcoin Standard.
                            </p>
                            <p className="flex items-center gap-1">
                                <HugeiconsIcon icon={CopyrightIcon} size={12} className="inline-block" />
                                <span>{currentYear} Apollo.</span>
                                <span className="text-purple-500 font-semibold">NOSTR</span>
                                <span>+</span>
                                <HugeiconsIcon icon={BitcoinEllipseIcon} size={14} className="text-amber-500" />
                                <HugeiconsIcon icon={FlashIcon} size={12} className="text-amber-400 -ml-0.5" />
                            </p>
                        </div>
                    </div>
                </DialogPanel>
            </div>
        </Dialog>
    );
};

export default MobileMenuPortal;
