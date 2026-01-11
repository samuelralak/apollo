import { useState, useMemo } from "react";
import { Tab, TabGroup, TabList, TabPanel, TabPanels } from "@headlessui/react";
import { useNotifications } from "../hooks";
import { NotificationItem, NotificationEmptyState } from "../components";
import { NotificationCategory } from "../types/notification.types";
import SEOContainer from "../../../shared/components/SEOContainer";

const CATEGORY_TABS = [
    { key: "all", label: "All", category: null },
    { key: "qa", label: "Q&A", category: NotificationCategory.QA },
    { key: "engagement", label: "Votes", category: NotificationCategory.ENGAGEMENT },
    { key: "social", label: "Social", category: NotificationCategory.SOCIAL },
    { key: "zaps", label: "Zaps", category: NotificationCategory.ZAPS }
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

    const isLoading = loading || !initialized;

    return (
        <>
            <SEOContainer
                title="Notifications"
                description="Your notifications on Apollo"
            />

            <div className="max-w-3xl">
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
                    {hasUnread && (
                        <button
                            type="button"
                            onClick={markAllAsRead}
                            className="text-sm font-medium text-teal-600 dark:text-teal-400 hover:text-teal-700 dark:hover:text-teal-300 transition-colors"
                        >
                            Mark all as read
                        </button>
                    )}
                </header>

                {/* Category tabs */}
                <TabGroup selectedIndex={selectedIndex} onChange={setSelectedIndex}>
                    <TabList className="flex gap-1 border-b border-slate-200 dark:border-slate-700 mb-4 overflow-x-auto">
                        {CATEGORY_TABS.map((tab) => (
                            <Tab
                                key={tab.key}
                                className={({ selected }) =>
                                    `px-4 py-2 text-sm font-medium border-b-2 -mb-px whitespace-nowrap transition-colors focus:outline-none ${
                                        selected
                                            ? 'border-teal-600 dark:border-teal-500 text-teal-600 dark:text-teal-400'
                                            : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300 hover:border-slate-300 dark:hover:border-slate-600'
                                    }`
                                }
                            >
                                {tab.label}
                            </Tab>
                        ))}
                    </TabList>

                    <TabPanels>
                        {CATEGORY_TABS.map((tab) => (
                            <TabPanel key={tab.key}>
                                {isLoading ? (
                                    <div className="space-y-4">
                                        {[1, 2, 3].map(i => (
                                            <div key={i} className="animate-pulse flex gap-3 p-4">
                                                <div className="w-10 h-10 bg-slate-200 dark:bg-slate-700 rounded-full" />
                                                <div className="flex-1">
                                                    <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-3/4 mb-2" />
                                                    <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded w-1/4" />
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : filteredNotifications.length > 0 ? (
                                    <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm ring-1 ring-slate-200 dark:ring-slate-700 divide-y divide-slate-100 dark:divide-slate-700 overflow-hidden">
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
