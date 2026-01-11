import { Switch } from "@headlessui/react";
import { useNotificationSettings } from "../../../notification/hooks";
import { NotificationCategory } from "../../../notification/types/notification.types";

const CATEGORY_INFO = [
    {
        category: NotificationCategory.QA,
        label: "Q&A Activity",
        description: "Answers to your questions, comments on your answers, accepted answers, and mentions"
    },
    {
        category: NotificationCategory.ENGAGEMENT,
        label: "Votes",
        description: "Upvotes and downvotes on your questions and answers"
    },
    {
        category: NotificationCategory.SOCIAL,
        label: "Social",
        description: "New followers"
    },
    {
        category: NotificationCategory.ZAPS,
        label: "Zaps",
        description: "Lightning zaps on your content"
    }
] as const;

const NotificationsSettingsPage = () => {
    const {
        settings,
        toggleCategoryEnabled,
        toggleInApp,
        resetSettings,
        isCategoryEnabled
    } = useNotificationSettings();

    return (
        <div className="mx-auto max-w-2xl space-y-16 sm:space-y-20 lg:mx-0 lg:max-w-none">
            <div>
                <h2 className="text-base font-semibold leading-7 text-slate-900 dark:text-slate-100">
                    Notifications
                </h2>
                <p className="mt-1 text-sm leading-6 text-slate-500 dark:text-slate-400 mb-6">
                    Control which notifications you receive
                </p>

                {/* Category toggles */}
                <div className="space-y-6">
                    <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm ring-1 ring-slate-200 dark:ring-slate-700 divide-y divide-slate-100 dark:divide-slate-700">
                        {CATEGORY_INFO.map(({ category, label, description }) => (
                            <div key={category} className="flex items-center justify-between px-4 py-4 sm:px-6">
                                <div className="flex-1 min-w-0 pr-4">
                                    <p className="text-sm font-medium text-slate-900 dark:text-slate-100">
                                        {label}
                                    </p>
                                    <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
                                        {description}
                                    </p>
                                </div>
                                <Switch
                                    checked={isCategoryEnabled(category)}
                                    onChange={() => toggleCategoryEnabled(category)}
                                    className={`${
                                        isCategoryEnabled(category)
                                            ? 'bg-teal-600 dark:bg-teal-500'
                                            : 'bg-slate-200 dark:bg-slate-700'
                                    } relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2 dark:focus:ring-offset-slate-900`}
                                >
                                    <span className="sr-only">
                                        {isCategoryEnabled(category) ? 'Disable' : 'Enable'} {label}
                                    </span>
                                    <span
                                        className={`${
                                            isCategoryEnabled(category) ? 'translate-x-6' : 'translate-x-1'
                                        } inline-block h-4 w-4 transform rounded-full bg-white transition-transform`}
                                    />
                                </Switch>
                            </div>
                        ))}
                    </div>

                    {/* Additional settings */}
                    <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm ring-1 ring-slate-200 dark:ring-slate-700 divide-y divide-slate-100 dark:divide-slate-700">
                        <div className="flex items-center justify-between px-4 py-4 sm:px-6">
                            <div className="flex-1 min-w-0 pr-4">
                                <p className="text-sm font-medium text-slate-900 dark:text-slate-100">
                                    Show in-app notifications
                                </p>
                                <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
                                    Display the notification bell and badge in the navigation
                                </p>
                            </div>
                            <Switch
                                checked={settings.showInApp}
                                onChange={toggleInApp}
                                className={`${
                                    settings.showInApp
                                        ? 'bg-teal-600 dark:bg-teal-500'
                                        : 'bg-slate-200 dark:bg-slate-700'
                                } relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2 dark:focus:ring-offset-slate-900`}
                            >
                                <span className="sr-only">
                                    {settings.showInApp ? 'Disable' : 'Enable'} in-app notifications
                                </span>
                                <span
                                    className={`${
                                        settings.showInApp ? 'translate-x-6' : 'translate-x-1'
                                    } inline-block h-4 w-4 transform rounded-full bg-white transition-transform`}
                                />
                            </Switch>
                        </div>

                        {/* Aggregate similar - coming soon */}
                        <div className="flex items-center justify-between px-4 py-4 sm:px-6 opacity-50">
                            <div className="flex-1 min-w-0 pr-4">
                                <p className="text-sm font-medium text-slate-900 dark:text-slate-100">
                                    Group similar notifications
                                    <span className="ml-2 inline-flex items-center rounded px-1.5 py-0.5 text-[10px] font-medium bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400">
                                        Coming soon
                                    </span>
                                </p>
                                <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
                                    Combine similar notifications (e.g., "3 people upvoted your question")
                                </p>
                            </div>
                            <Switch
                                checked={settings.aggregateSimilar}
                                disabled
                                className="bg-slate-200 dark:bg-slate-700 relative inline-flex h-6 w-11 items-center rounded-full cursor-not-allowed"
                            >
                                <span className="sr-only">Group similar notifications (coming soon)</span>
                                <span
                                    className={`${
                                        settings.aggregateSimilar ? 'translate-x-6' : 'translate-x-1'
                                    } inline-block h-4 w-4 transform rounded-full bg-white transition-transform`}
                                />
                            </Switch>
                        </div>
                    </div>

                    {/* Reset button */}
                    <div className="flex justify-end">
                        <button
                            type="button"
                            onClick={resetSettings}
                            className="text-sm font-medium text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300 transition-colors"
                        >
                            Reset to defaults
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default NotificationsSettingsPage;
