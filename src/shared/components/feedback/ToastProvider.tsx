import {createContext, ReactNode, useState} from "react";
import {createPortal} from "react-dom";
import {CheckCircleIcon} from '@heroicons/react/24/outline'
import {XMarkIcon} from '@heroicons/react/20/solid'

const TOAST_TIMEOUT = 3000

interface ToastState {
    visible: boolean;
    title: string;
    type?: 'info' | 'success' | 'warning' | 'error'
    subtitle?: string;
}

const defaultToastState = {
    visible: false,
    title: 'Info',
    type: 'info'
} as ToastState

export interface ToastContext {
    showToast: (params: Omit<ToastState, 'visible'>) => void
}

export const ToastContext = createContext<ToastContext | null>(null)

const ToastProvider = ({children}: { children: ReactNode }) => {
    const [toastVisible, setToastVisible] = useState<ToastState>(defaultToastState)

    const dismissToast = () => {
        setToastVisible({...defaultToastState, visible: false})
        const timeout = setTimeout(() => {
            setToastVisible(defaultToastState)
            clearTimeout(timeout)
        }, 1500)
    }

    const showToast = (params: Omit<ToastState, 'visible'>) => {
        setToastVisible({...toastVisible, ...{...params, visible: true}})

        const timeout = setTimeout(() => {
            dismissToast()
            clearTimeout(timeout)
        }, TOAST_TIMEOUT)
    }

    return (
        <ToastContext.Provider value={{showToast}}>
            {children}
            {toastVisible.visible && createPortal(
                <div
                    aria-live="assertive"
                    className="pointer-events-none fixed inset-0 flex items-end px-4 py-6 sm:items-start sm:p-6 z-[100]"
                >
                    <div className="flex w-full flex-col items-center space-y-4 sm:items-end">
                        {/* Notification panel, dynamically insert this into the live region when it needs to be displayed */}
                        <div
                            className="pointer-events-auto w-full max-w-sm overflow-hidden rounded-lg bg-white dark:bg-slate-800 shadow-lg ring-1 ring-black/5 dark:ring-white/10 transform transition ease-out duration-300">
                            <div className="p-4">
                                <div className="flex items-start">
                                    <div className="flex-shrink-0">
                                        <CheckCircleIcon className="h-6 w-6 text-green-500 dark:text-green-400" aria-hidden="true"/>
                                    </div>
                                    <div className="ml-3 w-0 flex-1 pt-0.5">
                                        <p className="text-sm font-medium text-slate-900 dark:text-slate-100">{toastVisible.title}!</p>
                                        {toastVisible?.subtitle && (
                                            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                                                {toastVisible.subtitle}
                                            </p>
                                        )}
                                    </div>
                                    <div className="ml-4 flex flex-shrink-0">
                                        <button
                                            type="button"
                                            className="inline-flex rounded-md bg-white dark:bg-slate-800 text-slate-400 dark:text-slate-500 hover:text-slate-500 dark:hover:text-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2 dark:focus:ring-offset-slate-800"
                                            onClick={dismissToast}
                                        >
                                            <span className="sr-only">Close</span>
                                            <XMarkIcon className="h-5 w-5" aria-hidden="true"/>
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
