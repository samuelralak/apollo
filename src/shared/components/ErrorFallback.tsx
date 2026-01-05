import { ExclamationTriangleIcon, ArrowPathIcon } from '@heroicons/react/24/outline';

interface ErrorFallbackProps {
    error?: Error | null;
    onRetry?: () => void;
}

const ErrorFallback = ({ error, onRetry }: ErrorFallbackProps) => {
    return (
        <div className="flex min-h-[400px] flex-col items-center justify-center px-4 py-16">
            <div className="text-center">
                <ExclamationTriangleIcon className="mx-auto h-12 w-12 text-amber-500" />
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
                        <ArrowPathIcon className="h-4 w-4" />
                        Try again
                    </button>
                )}
            </div>
        </div>
    );
};

export default ErrorFallback;
