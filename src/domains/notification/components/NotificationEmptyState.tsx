import { HugeiconsIcon } from "@hugeicons/react";
import { Notification01Icon } from "@hugeicons-pro/core-duotone-rounded";

interface NotificationEmptyStateProps {
    /** Optional custom message */
    message?: string;
}

const NotificationEmptyState = ({ message = "No notifications yet" }: NotificationEmptyStateProps) => {
    return (
        <div className="flex flex-col items-center justify-center py-8 px-4">
            <div className="p-3 rounded-full bg-slate-100 dark:bg-slate-700/50 mb-3">
                <HugeiconsIcon
                    icon={Notification01Icon}
                    size={24}
                    className="text-slate-400 dark:text-slate-500"
                />
            </div>
            <p className="text-sm text-slate-500 dark:text-slate-400 text-center">
                {message}
            </p>
            <p className="text-xs text-slate-400 dark:text-slate-500 text-center mt-1">
                We'll notify you when there's activity on your questions
            </p>
        </div>
    );
};

export default NotificationEmptyState;
