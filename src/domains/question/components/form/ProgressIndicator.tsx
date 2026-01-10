import { CheckCircleIcon } from "@heroicons/react/20/solid";
import { useMemo, useState, useEffect } from "react";
import type { FormProgress, DraftStatus } from "../../hooks/useQuestionForm";

interface Props {
    progress: FormProgress;
    draftStatus: DraftStatus;
}

const formatTimeDiff = (timestamp: number | null, now: number): string => {
    if (!timestamp) return ''
    const diff = now - timestamp
    if (diff < 60000) return 'just now'
    if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`
    return `${Math.floor(diff / 3600000)}h ago`
}

const ProgressIndicator = ({ progress, draftStatus }: Props) => {
    const [now, setNow] = useState(() => Date.now())

    // Update the time reference periodically for "X minutes ago" display
    useEffect(() => {
        const interval = setInterval(() => setNow(Date.now()), 60000)
        return () => clearInterval(interval)
    }, [])

    const steps = useMemo(() => [
        { key: 'category', label: 'Category', completed: progress.category },
        { key: 'title', label: 'Title', completed: progress.title },
        { key: 'description', label: 'Details', completed: progress.description },
        { key: 'tags', label: 'Tags', completed: progress.tags },
    ] as const, [progress.category, progress.title, progress.description, progress.tags])

    const lastSavedText = useMemo(
        () => formatTimeDiff(draftStatus.lastSavedAt, now),
        [draftStatus.lastSavedAt, now]
    )

    return (
        <div className="rounded-lg bg-slate-50 dark:bg-slate-800/50 p-4 ring-1 ring-slate-200 dark:ring-slate-700">
            {/* Progress Bar */}
            <div className="mb-3">
                <div className="flex items-center justify-between mb-1.5">
                    <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                        Progress
                    </span>
                    <span className="text-sm font-medium text-teal-600 dark:text-teal-400">
                        {progress.percentage}%
                    </span>
                </div>
                <div className="h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                    <div
                        className="h-full bg-teal-500 dark:bg-teal-400 rounded-full transition-all duration-300"
                        style={{ width: `${progress.percentage}%` }}
                    />
                </div>
            </div>

            {/* Step Indicators */}
            <div className="flex items-center justify-between gap-2">
                {steps.map((step) => (
                    <div
                        key={step.key}
                        className={`flex items-center gap-1.5 text-xs ${
                            step.completed
                                ? 'text-teal-600 dark:text-teal-400'
                                : 'text-slate-400 dark:text-slate-500'
                        }`}
                    >
                        {step.completed ? (
                            <CheckCircleIcon className="h-4 w-4" />
                        ) : (
                            <div className="h-4 w-4 rounded-full border-2 border-current" />
                        )}
                        <span className="hidden sm:inline">{step.label}</span>
                    </div>
                ))}
            </div>

            {/* Draft Status */}
            {draftStatus.hasDraft && (
                <div className="mt-3 pt-3 border-t border-slate-200 dark:border-slate-700">
                    <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                        {draftStatus.isSaving ? (
                            <>
                                <div className="h-3 w-3 border-2 border-slate-300 dark:border-slate-600 border-t-teal-500 dark:border-t-teal-400 rounded-full animate-spin" />
                                <span>Saving draft...</span>
                            </>
                        ) : (
                            <>
                                <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                                </svg>
                                <span>Draft saved {lastSavedText}</span>
                            </>
                        )}
                    </div>
                </div>
            )}
        </div>
    )
}

export default ProgressIndicator
