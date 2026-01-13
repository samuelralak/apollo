import { useState, useMemo } from "react";
import { Link } from "react-router";
import { Tab, TabGroup, TabList, TabPanel, TabPanels } from "@headlessui/react";
import { HugeiconsIcon } from "@hugeicons/react";
import { Settings01Icon } from "@hugeicons-pro/core-twotone-rounded";
import { useNotifications } from "../hooks";
import { NotificationItem, NotificationEmptyState } from "../components";
import { NotificationCategory } from "../types/notification.types";
import SEOContainer from "../../../shared/components/SEOContainer";
import { classNames } from "../../../utils";

const CATEGORY_TABS = [
    { key: "all", label: "All", category: null, emptyDescription: "We'll notify you when there's activity on your questions" },
    { key: "qa", label: "Q&A", category: NotificationCategory.QA, emptyDescription: "Answers and comments on your questions will appear here" },
    { key: "engagement", label: "Votes", category: NotificationCategory.ENGAGEMENT, emptyDescription: "Upvotes and downvotes on your content will appear here" },
    { key: "social", label: "Social", category: NotificationCategory.SOCIAL, emptyDescription: "New followers will appear here" },
    { key: "zaps", label: "Zaps", category: NotificationCategory.ZAPS, emptyDescription: "Lightning zaps you receive will appear here" }
] as const;

const NotificationsPage = () => {
    const [selectedIndex, setSelectedIndex] = useState(0);
    const {
        notifications,
        unreadCount,
        hasUnread,
        loading,
        initialized,
        markAllAsRead,
        markAsRead,
        lastReadTimestamp,
        getByCategory
    } = useNotifications();

    // Efficient unread check using timestamp comparison (O(1) instead of O(n))
    const isUnread = (createdAt: number) => createdAt > lastReadTimestamp;

    // Get filtered notifications based on selected tab
    const filteredNotifications = useMemo(() => {
        const selectedTab = CATEGORY_TABS[selectedIndex];
        if (selectedTab.category === null) {
            return notifications;
        }
        return getByCategory(selectedTab.category);
    }, [selectedIndex, notifications, getByCategory]);

    // Calculate counts per category for tab badges
    const categoryCounts = useMemo(() => {
        const counts: Record<string, number> = {
            all: notifications.length,
            qa: getByCategory(NotificationCategory.QA).length,
            engagement: getByCategory(NotificationCategory.ENGAGEMENT).length,
            social: getByCategory(NotificationCategory.SOCIAL).length,
            zaps: getByCategory(NotificationCategory.ZAPS).length
        };
        return counts;
    }, [notifications, getByCategory]);

    const isLoading = loading || !initialized;

    return (
        <>
            <SEOContainer
                title="Notifications"
                description="Your notifications on Apollo"
            />

            <div className="max-w-3xl overflow-hidden">
                {/* Header */}
                <header className="mb-6 flex items-center justify-between">
                    <div>
                        <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-slate-100">
                            Notifications
                        </h1>
                        {unreadCount > 0 && (
                            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                                {unreadCount} unread {unreadCount === 1 ? 'notification' : 'notifications'}
                            </p>
                        )}
                    </div>
                    <div className="flex items-center gap-3">
                        {hasUnread && (
                            <button
                                type="button"
                                onClick={markAllAsRead}
                                className="text-sm font-medium text-teal-600 dark:text-teal-400 hover:text-teal-700 dark:hover:text-teal-300 transition-colors"
                            >
                                Mark all as read
                            </button>
                        )}
                        <Link
                            to="/settings/notifications"
                            className="p-2 rounded-lg text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                            aria-label="Notification settings"
                        >
                            <HugeiconsIcon icon={Settings01Icon} size={20} />
                        </Link>
                    </div>
                </header>

                {/* Category tabs */}
                <TabGroup selectedIndex={selectedIndex} onChange={setSelectedIndex}>
                    <TabList className="flex gap-4 md:gap-6 border-b border-slate-200 dark:border-slate-700 mb-6 overflow-x-auto scrollbar-hide">
                        {CATEGORY_TABS.map((tab) => {
                            const count = categoryCounts[tab.key];
                            return (
                                <Tab
                                    key={tab.key}
                                    className={({ selected }) =>
                                        classNames(
                                            selected
                                                ? 'border-teal-500 text-slate-900 dark:text-slate-100'
                                                : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300 hover:border-slate-300 dark:hover:border-slate-600',
                                            'flex items-center gap-2 border-b-2 pb-3 text-sm font-medium whitespace-nowrap transition-colors focus:outline-none'
                                        )
                                    }
                                >
                                    {({ selected }) => (
                                        <>
                                            {tab.label}
                                            {count > 0 && (
                                                <span className={classNames(
                                                    selected
                                                        ? 'bg-slate-200 dark:bg-slate-700'
                                                        : 'bg-slate-100 dark:bg-slate-800',
                                                    'px-2 py-0.5 rounded-full text-xs tabular-nums'
                                                )}>
                                                    {count}
                                                </span>
                                            )}
                                        </>
                                    )}
                                </Tab>
                            );
                        })}
                    </TabList>

                    <TabPanels>
                        {CATEGORY_TABS.map((tab) => (
                            <TabPanel key={tab.key}>
                                {isLoading ? (
                                    <div className="divide-y divide-slate-100 dark:divide-slate-800">
                                        {[1, 2, 3, 4, 5].map(i => (
                                            <div key={i} className="animate-pulse flex items-start gap-3 py-4">
                                                <div className="flex-shrink-0 w-10 h-10 bg-slate-200 dark:bg-slate-700 rounded-full" />
                                                <div className="flex-1 min-w-0 py-0.5">
                                                    <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-3/4 mb-2" />
                                                    <div className="h-3 bg-slate-100 dark:bg-slate-700/50 rounded w-1/2 mb-2" />
                                                    <div className="h-3 bg-slate-100 dark:bg-slate-700/50 rounded w-1/4" />
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : filteredNotifications.length > 0 ? (
                                    <div className="divide-y divide-slate-100 dark:divide-slate-800">
                                        {filteredNotifications.map(notification => (
                                            <NotificationItem
                                                key={notification.id}
                                                notification={notification}
                                                isUnread={isUnread(notification.createdAt)}
                                                onClick={() => markAsRead(notification)}
                                            />
                                        ))}
                                    </div>
                                ) : (
                                    <NotificationEmptyState
                                        message={
                                            tab.category
                                                ? `No ${tab.label.toLowerCase()} notifications`
                                                : "No notifications yet"
                                        }
                                        description={tab.emptyDescription}
                                    />
                                )}
                            </TabPanel>
                        ))}
                    </TabPanels>
                </TabGroup>
            </div>
        </>
    );
};

export default NotificationsPage;
