import {Dialog, DialogBackdrop, DialogPanel} from "@headlessui/react";
import {HugeiconsIcon} from "@hugeicons/react";
import {UserCircleIcon, Settings01Icon, Logout01Icon, Bookmark02Icon} from "@hugeicons-pro/core-twotone-rounded";
import {Link} from "react-router";
import {useDispatch, useSelector} from "react-redux";
import {AppDispatch, RootState} from "../../../app/store";
import {hidePortal} from "../../store/portal.slice";
import {signOut} from "../../../domains/auth/store/auth.slice";
import {ThemeToggle} from "../../theme";

const MobileMenuPortal = () => {
    const dispatch = useDispatch<AppDispatch>()
    const visible = useSelector((state: RootState) => state.portal.visible)
    const auth = useSelector((state: RootState) => state.auth)

    const handleClose = () => dispatch(hidePortal())
    const handleSignOut = () => {
        dispatch(signOut())
        handleClose()
    }

    const linkClass = "block px-4 py-3 text-base font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors"
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
                    <Link to="/" onClick={handleClose} className={linkClass}>
                        Home
                    </Link>
                    <Link to="/about" onClick={handleClose} className={linkClass}>
                        About
                    </Link>

                    {auth.isLoggedIn && (
                        <>
                            <div className="border-t border-slate-100 dark:border-slate-700" />
                            <Link to={`/user/${auth.pubkey}`} onClick={handleClose} className={iconLinkClass}>
                                <HugeiconsIcon icon={UserCircleIcon} size={20} className="text-slate-400 dark:text-slate-500" />
                                Your Profile
                            </Link>
                            <Link to="/bookmarks" onClick={handleClose} className={iconLinkClass}>
                                <HugeiconsIcon icon={Bookmark02Icon} size={20} className="text-slate-400 dark:text-slate-500" />
                                Bookmarks
                            </Link>
                            <Link to="/settings/user-profile" onClick={handleClose} className={iconLinkClass}>
                                <HugeiconsIcon icon={Settings01Icon} size={20} className="text-slate-400 dark:text-slate-500" />
                                Settings
                            </Link>
                            <button type="button" onClick={handleSignOut} className={`${iconLinkClass} w-full`}>
                                <HugeiconsIcon icon={Logout01Icon} size={20} className="text-slate-400 dark:text-slate-500" />
                                Sign out
                            </button>
                        </>
                    )}

                    <div className="border-t border-slate-100 dark:border-slate-700" />
                    <div className="flex items-center justify-between px-4 py-3">
                        <span className="text-base font-medium text-slate-700 dark:text-slate-200">Appearance</span>
                        <ThemeToggle />
                    </div>
                </DialogPanel>
            </div>
        </Dialog>
    )
}

export default MobileMenuPortal
