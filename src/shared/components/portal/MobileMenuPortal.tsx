import {Dialog, DialogBackdrop, DialogPanel} from "@headlessui/react";
import {HugeiconsIcon} from "@hugeicons/react";
import {Settings01Icon, Logout01Icon, Bookmark02Icon, AtIcon, InformationCircleIcon} from "@hugeicons-pro/core-twotone-rounded";
import {Link} from "react-router";
import {useDispatch, useSelector} from "react-redux";
import {AppDispatch, RootState} from "../../../app/store";
import {hidePortal} from "../../store/portal.slice";
import {signOut} from "../../../domains/auth/store/auth.slice";
import {ThemeToggle} from "../../theme";

/**
 * MobileMenuPortal - Secondary menu for mobile users
 * Contains items not available in the bottom tab bar:
 * - Bookmarks, Invites, Settings (auth-required)
 * - About, Theme toggle (always visible)
 * - Sign out (auth-required)
 */
const MobileMenuPortal = () => {
    const dispatch = useDispatch<AppDispatch>()
    const visible = useSelector((state: RootState) => state.portal.visible)
    const auth = useSelector((state: RootState) => state.auth)

    const handleClose = () => dispatch(hidePortal())
    const handleSignOut = () => {
        dispatch(signOut())
        handleClose()
    }

    const iconLinkClass = "flex items-center gap-3 px-4 py-3 text-base font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors"

    return (
        <Dialog open={visible} onClose={handleClose} className="relative z-50 md:hidden">
            <DialogBackdrop
                transition
                className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity duration-300 ease-out data-closed:opacity-0"
            />

            <div className="fixed inset-0 flex items-start justify-center p-4 pt-16">
                <DialogPanel
                    transition
                    className="w-full max-w-sm rounded-xl bg-white dark:bg-slate-800 shadow-2xl ring-1 ring-slate-200 dark:ring-slate-700 overflow-hidden transition-all duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] data-closed:opacity-0 data-closed:scale-95 data-closed:-translate-y-4"
                >
                    {/* Auth-required navigation items */}
                    {auth.isLoggedIn && (
                        <>
                            <Link to="/bookmarks" onClick={handleClose} className={iconLinkClass}>
                                <HugeiconsIcon icon={Bookmark02Icon} size={20} className="text-slate-400 dark:text-slate-500" />
                                Bookmarks
                            </Link>
                            <Link to="/invites" onClick={handleClose} className={iconLinkClass}>
                                <HugeiconsIcon icon={AtIcon} size={20} className="text-slate-400 dark:text-slate-500" />
                                Invites
                            </Link>
                            <Link to="/settings/user-profile" onClick={handleClose} className={iconLinkClass}>
                                <HugeiconsIcon icon={Settings01Icon} size={20} className="text-slate-400 dark:text-slate-500" />
                                Settings
                            </Link>
                            <div className="border-t border-slate-100 dark:border-slate-700" />
                        </>
                    )}

                    {/* Always visible items */}
                    <Link to="/about" onClick={handleClose} className={iconLinkClass}>
                        <HugeiconsIcon icon={InformationCircleIcon} size={20} className="text-slate-400 dark:text-slate-500" />
                        About
                    </Link>

                    <div className="border-t border-slate-100 dark:border-slate-700" />
                    <div className="flex items-center justify-between px-4 py-3">
                        <span className="text-base font-medium text-slate-700 dark:text-slate-200">Appearance</span>
                        <ThemeToggle />
                    </div>

                    {/* Sign out for logged in users */}
                    {auth.isLoggedIn && (
                        <>
                            <div className="border-t border-slate-100 dark:border-slate-700" />
                            <button type="button" onClick={handleSignOut} className={`${iconLinkClass} w-full`}>
                                <HugeiconsIcon icon={Logout01Icon} size={20} className="text-slate-400 dark:text-slate-500" />
                                Sign out
                            </button>
                        </>
                    )}
                </DialogPanel>
            </div>
        </Dialog>
    )
}

export default MobileMenuPortal
