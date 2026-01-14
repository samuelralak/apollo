import {HugeiconsIcon} from "@hugeicons/react";
import {Notification03Icon, UserCircleIcon} from "@hugeicons-pro/core-twotone-rounded";
import {DisclosureButton} from "@headlessui/react";
import {useDispatch, useSelector} from "react-redux";
import {AppDispatch, RootState} from "../../../app/store";
import {AuthState, signOut} from "../store/auth.slice";
import {getDisplayName} from "../../../utils";

const UserMenuMobile = ({auth}: { auth: AuthState }) => {
    const dispatch = useDispatch() as AppDispatch
    const onSignOut = () => dispatch(signOut())

    // Get notification state for badge
    const { ids, lastReadTimestamp, settings } = useSelector((state: RootState) => state.notification);
    const byId = useSelector((state: RootState) => state.notification.byId);
    const showNotifications = settings.showInApp;

    // Calculate unread count (only if notifications are enabled)
    const unreadCount = showNotifications
        ? ids.filter(id => {
            const n = byId[id];
            return n && n.createdAt > lastReadTimestamp && settings.enabled[n.category];
        }).length
        : 0;

    return (
        <div className="border-t border-slate-200 dark:border-slate-700 pb-3 pt-4">
            <div className="flex items-center px-4 sm:px-6">
                <div className="flex-shrink-0">
                    {auth.userProfile?.image || auth.userProfile?.picture ? (
                        <img className="h-10 w-10 rounded-lg object-cover" src={auth.userProfile.image ?? auth.userProfile?.picture} alt="avatar"/>
                    ) : (
                        <span className="h-10 w-10 rounded-lg flex items-center justify-center">
                            <HugeiconsIcon icon={UserCircleIcon} className="text-slate-400 dark:text-slate-500" size={40} />
                        </span>
                    )}
                </div>

                <div className="ml-3 min-w-0 flex-1">
                    <div className="text-base font-medium text-slate-800 dark:text-slate-200 truncate">
                        {getDisplayName(auth.userProfile, auth.pubkey)}
                    </div>
                    {auth.userProfile?.nip05 && (
                        <div className="text-sm font-medium text-slate-500 dark:text-slate-400 truncate">
                            {auth.userProfile.nip05}
                        </div>
                    )}
                </div>
                {showNotifications && (
                    <DisclosureButton
                        as="a"
                        href="/notifications"
                        className="relative ml-auto flex-shrink-0 rounded-full bg-white dark:bg-slate-800 p-1 text-slate-400 dark:text-slate-500 hover:text-slate-500 dark:hover:text-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2 dark:focus:ring-offset-slate-900"
                    >
                        <span className="sr-only">View notifications</span>
                        <HugeiconsIcon icon={Notification03Icon} size={24} aria-hidden="true" />
                        {unreadCount > 0 && (
                            <span className="absolute -top-1 -right-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-red-500 dark:bg-red-400 px-1 text-[10px] font-bold text-white ring-2 ring-white dark:ring-slate-800">
                                {unreadCount > 99 ? '99+' : unreadCount}
                            </span>
                        )}
                    </DisclosureButton>
                )}
            </div>
            <div className="mt-3 space-y-1">
                <DisclosureButton
                    as="a"
                    href={`/user/${auth.pubkey}`}
                    className="block px-4 py-2 text-base font-medium text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-800 dark:hover:text-slate-200 sm:px-6"
                >
                    Your Profile
                </DisclosureButton>
                {showNotifications && (
                    <DisclosureButton
                        as="a"
                        href="/notifications"
                        className="flex items-center justify-between px-4 py-2 text-base font-medium text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-800 dark:hover:text-slate-200 sm:px-6"
                    >
                        <span>Notifications</span>
                        {unreadCount > 0 && (
                            <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-red-500 dark:bg-red-400 px-1.5 text-[10px] font-bold text-white">
                                {unreadCount > 99 ? '99+' : unreadCount}
                            </span>
                        )}
                    </DisclosureButton>
                )}
                <DisclosureButton
                    as="a"
                    href="/bookmarks"
                    className="block px-4 py-2 text-base font-medium text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-800 dark:hover:text-slate-200 sm:px-6"
                >
                    Bookmarks
                </DisclosureButton>
                <DisclosureButton
                    as="a"
                    href="/settings/user-profile"
                    className="block px-4 py-2 text-base font-medium text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-800 dark:hover:text-slate-200 sm:px-6"
                >
                    Settings
                </DisclosureButton>
                <DisclosureButton
                    as="a"
                    onClick={onSignOut}
                    className="block px-4 py-2 text-base font-medium text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-800 dark:hover:text-slate-200 sm:px-6 cursor-pointer"
                >
                    Sign out
                </DisclosureButton>
            </div>
        </div>
    )
}

export default UserMenuMobile
