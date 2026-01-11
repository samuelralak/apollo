import { HugeiconsIcon } from "@hugeicons/react";
import { Notification01Icon } from "@hugeicons-pro/core-duotone-rounded";

interface NotificationEmptyStateProps {
    /** Optional custom message */
    message?: string;
    /** Optional custom description */
    description?: string;
    /** Compact mode for dropdown */
    compact?: boolean;
}

const NotificationEmptyState = ({
    message = "No notifications yet",
    description = "We'll notify you when there's activity on your questions",
    compact = false
}: NotificationEmptyStateProps) => {
    if (compact) {
        return (
            <div className="text-center py-8 px-4">
                <div className="inline-flex p-2 rounded-full bg-slate-100 dark:bg-slate-800 mb-3">
                    <HugeiconsIcon
                        icon={Notification01Icon}
                        size={20}
                        className="text-slate-400 dark:text-slate-500"
                    />
                </div>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                    {message}
                </p>
            </div>
        );
    }

    return (
        <div className="text-center py-12">
            <div className="mx-auto h-16 w-16 flex items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800 ring-1 ring-slate-200 dark:ring-slate-700 mb-4">
                <HugeiconsIcon
                    icon={Notification01Icon}
                    size={28}
                    className="text-slate-400 dark:text-slate-500"
                />
            </div>
            <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-2">
                {message}
            </h3>
            <p className="text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
                {description}
            </p>
        </div>
    );
};

export default NotificationEmptyState;
