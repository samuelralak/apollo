import {createContext, ReactNode, useState, useCallback} from "react";
import {createPortal} from "react-dom";
import {useTimeoutEffect} from "@react-hookz/web";
import {HugeiconsIcon} from "@hugeicons/react";
import type {IconSvgElement} from "@hugeicons/react";
import {CheckmarkCircle02Icon, Cancel01Icon, Alert02Icon, InformationCircleIcon} from "@hugeicons-pro/core-twotone-rounded";

const TOAST_TIMEOUT = 3000

interface ToastState {
    visible: boolean;
    title: string;
    type?: 'info' | 'success' | 'warning' | 'error'
    subtitle?: string;
}

const defaultToastState: ToastState = {
    visible: false,
    title: '',
    type: 'info'
}

interface ToastConfig {
    icon: IconSvgElement;
    iconColor: string;
    bgColor: string;
}

const toastConfig: Record<NonNullable<ToastState['type']>, ToastConfig> = {
    success: {
        icon: CheckmarkCircle02Icon,
        iconColor: 'text-green-500 dark:text-green-400',
        bgColor: 'bg-green-50 dark:bg-green-900/20'
    },
    error: {
        icon: Cancel01Icon,
        iconColor: 'text-red-500 dark:text-red-400',
        bgColor: 'bg-red-50 dark:bg-red-900/20'
    },
    warning: {
        icon: Alert02Icon,
        iconColor: 'text-yellow-500 dark:text-yellow-400',
        bgColor: 'bg-yellow-50 dark:bg-yellow-900/20'
    },
    info: {
        icon: InformationCircleIcon,
        iconColor: 'text-blue-500 dark:text-blue-400',
        bgColor: 'bg-blue-50 dark:bg-blue-900/20'
    }
};

export interface ToastContext {
    showToast: (params: Omit<ToastState, 'visible'>) => void
}

export const ToastContext = createContext<ToastContext | null>(null)

const ToastProvider = ({children}: { children: ReactNode }) => {
    const [toastState, setToastState] = useState<ToastState>(defaultToastState)

    const dismissToast = useCallback(() => {
        setToastState(prev => ({...prev, visible: false}))
    }, [])

    // Auto-dismiss timeout - resets when toastState.visible changes
    const [, resetTimeout] = useTimeoutEffect(
        () => dismissToast(),
        toastState.visible ? TOAST_TIMEOUT : undefined
    )

    const showToast = useCallback((params: Omit<ToastState, 'visible'>) => {
        setToastState({...params, visible: true})
        resetTimeout()
    }, [resetTimeout])

    const config = toastConfig[toastState.type ?? 'info']

    return (
        <ToastContext.Provider value={{showToast}}>
            {children}
            {toastState.visible && createPortal(
                <div
                    aria-live="assertive"
                    className="pointer-events-none fixed inset-0 flex items-end px-4 py-6 sm:items-start sm:p-6 z-100"
                >
                    <div className="flex w-full flex-col items-center space-y-4 sm:items-end">
                        <div
                            className={`pointer-events-auto w-full max-w-sm overflow-hidden rounded-lg shadow-lg ring-1 ring-black/5 dark:ring-white/10 transform transition ease-out duration-300 ${config.bgColor} bg-white dark:bg-slate-800`}
                        >
                            <div className="p-4">
                                <div className="flex items-start">
                                    <div className="shrink-0">
                                        <HugeiconsIcon
                                            icon={config.icon}
                                            className={config.iconColor}
                                            size={24}
                                            aria-hidden="true"
                                        />
                                    </div>
                                    <div className="ml-3 w-0 flex-1 pt-0.5">
                                        <p className="text-sm font-medium text-slate-900 dark:text-slate-100">
                                            {toastState.title}
                                        </p>
                                        {toastState.subtitle && (
                                            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                                                {toastState.subtitle}
                                            </p>
                                        )}
                                    </div>
                                    <div className="ml-4 flex shrink-0">
                                        <button
                                            type="button"
                                            className="inline-flex rounded-md text-slate-400 dark:text-slate-500 hover:text-slate-500 dark:hover:text-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2 dark:focus:ring-offset-slate-800"
                                            onClick={dismissToast}
                                        >
                                            <span className="sr-only">Close</span>
                                            <HugeiconsIcon icon={Cancel01Icon} size={20} aria-hidden="true" />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>, document.body
            )}
        </ToastContext.Provider>
    )
}

export default ToastProvider
