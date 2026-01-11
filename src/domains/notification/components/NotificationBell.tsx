import { Link } from "react-router";
import { HugeiconsIcon } from "@hugeicons/react";
import { Notification01Icon, Settings01Icon } from "@hugeicons-pro/core-twotone-rounded";
import { Popover, PopoverButton, PopoverPanel } from "@headlessui/react";
import { useNotifications } from "../hooks";
import NotificationItem from "./NotificationItem";
import NotificationEmptyState from "./NotificationEmptyState";

/**
 * Notification bell button with dropdown panel
 *
 * Features:
 * - Badge with unread count
 * - Dropdown with recent notifications
 * - Mark all as read functionality
 * - Links to full notifications page and settings
 *
 * Note: showInApp setting is handled by parent component (UserMenuDesktop)
 * to avoid unnecessary hook calls when notifications are disabled.
 */
const NotificationBell = () => {
    const {
        notifications,
        unreadCount,
        hasUnread,
        loading,
        initialized,
        markAllAsRead,
        markAsRead,
        lastReadTimestamp
    } = useNotifications();

    // Display max 10 recent notifications in dropdown
    const recentNotifications = notifications.slice(0, 10);

    // Format badge count (max 99+)
    const badgeText = unreadCount > 99 ? "99+" : unreadCount.toString();

    // Efficient unread check using timestamp comparison (O(1) instead of O(n))
    const isUnread = (createdAt: number) => createdAt > lastReadTimestamp;

    return (
        <Popover className="relative hidden md:block">
            {({ close }) => (
                <>
                    <PopoverButton className="relative rounded-full p-2 text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2 dark:focus:ring-offset-slate-900 transition-colors">
                        <span className="sr-only">View notifications</span>
                        <HugeiconsIcon icon={Notification01Icon} size={20} />

                        {/* Unread badge */}
                        {hasUnread && (
                            <span className="absolute -top-0.5 -right-0.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-red-500 dark:bg-red-400 px-1 text-[10px] font-bold text-white">
                                {badgeText}
                            </span>
                        )}
                    </PopoverButton>

                    <PopoverPanel
                        transition
                        className="absolute right-0 z-10 mt-2 w-80 sm:w-96 origin-top-right rounded-xl bg-white dark:bg-slate-800 shadow-lg ring-1 ring-slate-200 dark:ring-slate-700 focus:outline-none transition ease-out duration-200 data-[closed]:opacity-0 data-[closed]:scale-95"
                    >
                        {/* Header */}
                        <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100 dark:border-slate-700">
                            <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                                Notifications
                            </h3>
                            {hasUnread && (
                                <button
                                    type="button"
                                    onClick={markAllAsRead}
                                    className="text-xs font-medium text-teal-600 dark:text-teal-400 hover:text-teal-700 dark:hover:text-teal-300 transition-colors"
                                >
                                    Mark all read
                                </button>
                            )}
                        </div>

                        {/* Content */}
                        <div className="max-h-[400px] overflow-y-auto">
                            {!initialized || loading ? (
                                <div className="flex items-center justify-center py-8">
                                    <div className="animate-spin rounded-full h-6 w-6 border-2 border-slate-200 dark:border-slate-700 border-t-teal-500" />
                                </div>
                            ) : recentNotifications.length === 0 ? (
                                <NotificationEmptyState />
                            ) : (
                                <div className="divide-y divide-slate-100 dark:divide-slate-700">
                                    {recentNotifications.map(notification => (
                                        <NotificationItem
                                            key={notification.id}
                                            notification={notification}
                                            isUnread={isUnread(notification.createdAt)}
                                            compact
                                            onClick={() => {
                                                markAsRead(notification);
                                                close();
                                            }}
                                        />
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Footer */}
                        <div className="flex items-center justify-between px-4 py-3 border-t border-slate-100 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 rounded-b-xl">
                            <Link
                                to="/notifications"
                                onClick={() => close()}
                                className="text-sm font-medium text-teal-600 dark:text-teal-400 hover:text-teal-700 dark:hover:text-teal-300 transition-colors"
                            >
                                View all notifications
                            </Link>
                            <Link
                                to="/settings/notifications"
                                onClick={() => close()}
                                className="p-1 rounded text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                                aria-label="Notification settings"
                            >
                                <HugeiconsIcon icon={Settings01Icon} size={18} />
                            </Link>
                        </div>
                    </PopoverPanel>
                </>
            )}
        </Popover>
    );
};

export default NotificationBell;
