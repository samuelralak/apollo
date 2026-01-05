import {HugeiconsIcon} from "@hugeicons/react";
import {Alert02Icon, ArrowReloadHorizontalIcon} from "@hugeicons-pro/core-twotone-rounded";

interface ErrorFallbackProps {
    error?: Error | null;
    onRetry?: () => void;
}

const ErrorFallback = ({ error, onRetry }: ErrorFallbackProps) => {
    return (
        <div className="flex min-h-[400px] flex-col items-center justify-center px-4 py-16">
            <div className="text-center">
                <HugeiconsIcon icon={Alert02Icon} className="mx-auto text-amber-500" size={48} />
                <h2 className="mt-4 text-lg font-semibold text-slate-900 dark:text-slate-100">
                    Something went wrong
                </h2>
                <p className="mt-2 text-sm text-slate-600 dark:text-slate-400 max-w-md">
                    {error?.message || 'An unexpected error occurred. Please try again.'}
                </p>
                {onRetry && (
                    <button
                        onClick={onRetry}
                        className="mt-6 inline-flex items-center gap-2 rounded-md bg-teal-600 px-4 py-2 text-sm font-medium text-white hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2 dark:focus:ring-offset-slate-900 transition-colors"
                    >
                        <HugeiconsIcon icon={ArrowReloadHorizontalIcon} size={16} />
                        Try again
                    </button>
                )}
            </div>
        </div>
    );
};

export default ErrorFallback;
