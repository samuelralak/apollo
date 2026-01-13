import { Dialog, DialogBackdrop, DialogPanel } from "@headlessui/react";
import { HugeiconsIcon } from "@hugeicons/react";
import {
    UserCircleIcon,
    Bookmark02Icon,
    AtIcon,
    Settings01Icon,
    InformationCircleIcon,
    FileValidationIcon,
    SecurityLockIcon,
    Github01Icon,
    Logout01Icon,
    CopyrightIcon,
    BitcoinEllipseIcon,
    FlashIcon,
} from "@hugeicons-pro/core-twotone-rounded";
import { Link } from "react-router";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "../../../app/store";
import { hidePortal } from "../../store/portal.slice";
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

    const menuItemClass = "flex items-center gap-3 px-5 py-3.5 text-[15px] font-medium text-slate-800 dark:text-slate-100 active:bg-slate-100 dark:active:bg-slate-800 transition-colors";
    const secondaryItemClass = "flex items-center gap-3 px-5 py-3 text-[14px] text-slate-600 dark:text-slate-300 active:bg-slate-100 dark:active:bg-slate-800 transition-colors";

    return (
        <Dialog open={visible} onClose={handleClose} className="relative z-50 md:hidden">
            <DialogBackdrop
                transition
                className="fixed inset-0 bg-black/40 transition-opacity duration-200 ease-out data-closed:opacity-0"
            />

            <div className="fixed inset-0 flex items-end">
                <DialogPanel
                    transition
                    className="w-full max-h-[80vh] rounded-t-2xl bg-white dark:bg-slate-900 shadow-2xl overflow-hidden transition-transform duration-300 ease-out data-closed:translate-y-full"
                >
                    {/* Drag handle */}
                    <div className="flex justify-center pt-3 pb-2">
                        <div className="w-10 h-1 rounded-full bg-slate-300 dark:bg-slate-700" />
                    </div>

                    {/* Scrollable content */}
                    <div className="overflow-y-auto max-h-[calc(80vh-24px)] pb-safe">
                        {/* Auth-required items */}
                        {auth.isLoggedIn && (
                            <>
                                <Link to={`/user/${auth.pubkey}`} onClick={handleClose} className={menuItemClass}>
                                    <HugeiconsIcon icon={UserCircleIcon} size={20} className="text-slate-500 dark:text-slate-400" />
                                    Profile
                                </Link>
                                <Link to="/bookmarks" onClick={handleClose} className={menuItemClass}>
                                    <HugeiconsIcon icon={Bookmark02Icon} size={20} className="text-slate-500 dark:text-slate-400" />
                                    Bookmarks
                                </Link>
                                <Link to="/invites" onClick={handleClose} className={menuItemClass}>
                                    <HugeiconsIcon icon={AtIcon} size={20} className="text-slate-500 dark:text-slate-400" />
                                    Invites
                                </Link>
                                <Link to="/settings/user-profile" onClick={handleClose} className={menuItemClass}>
                                    <HugeiconsIcon icon={Settings01Icon} size={20} className="text-slate-500 dark:text-slate-400" />
                                    Settings
                                </Link>
                                <div className="h-px bg-slate-100 dark:bg-slate-800 mx-4 my-1" />
                            </>
                        )}

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

                        <div className="h-px bg-slate-100 dark:bg-slate-800 mx-4 my-1" />

                        {/* Theme */}
                        <div className="flex items-center justify-between px-5 py-3">
                            <span className="text-[15px] font-medium text-slate-800 dark:text-slate-100">Appearance</span>
                            <ThemeToggle />
                        </div>

                        {/* Sign out */}
                        {auth.isLoggedIn && (
                            <>
                                <div className="h-px bg-slate-100 dark:bg-slate-800 mx-4 my-1" />
                                <button type="button" onClick={handleSignOut} className={`${menuItemClass} w-full`}>
                                    <HugeiconsIcon icon={Logout01Icon} size={20} className="text-red-500 dark:text-red-400" />
                                    <span className="text-red-600 dark:text-red-400">Sign out</span>
                                </button>
                            </>
                        )}

                        {/* Footer */}
                        <div className="h-px bg-slate-100 dark:bg-slate-800 mx-4 mt-1" />
                        <div className="px-5 py-4 text-[12px] text-slate-400 dark:text-slate-500">
                            <p className="mb-2 leading-relaxed">
                                Open source under AGPL-3.0. Built on The Bitcoin Standard.
                            </p>
                            <p className="flex items-center gap-1">
                                <HugeiconsIcon icon={CopyrightIcon} size={11} className="inline-block" />
                                <span>{currentYear} Apollo.</span>
                                <span className="text-purple-500 font-semibold">NOSTR</span>
                                <span>+</span>
                                <HugeiconsIcon icon={BitcoinEllipseIcon} size={13} className="text-amber-500" />
                                <HugeiconsIcon icon={FlashIcon} size={11} className="text-amber-400 -ml-0.5" />
                            </p>
                        </div>
                    </div>
                </DialogPanel>
            </div>
        </Dialog>
    );
};

export default MobileMenuPortal;
