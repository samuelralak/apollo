import {createContext, Fragment, ReactNode, useState} from "react";
import {createPortal} from "react-dom";
import {Transition} from '@headlessui/react'
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
                    className="pointer-events-none fixed inset-0 flex items-end px-4 py-6 sm:items-start sm:p-6"
                >
                    <div className="flex w-full flex-col items-center space-y-4 sm:items-end">
                        {/* Notification panel, dynamically insert this into the live region when it needs to be displayed */}
                        <Transition
                            show={toastVisible.visible}
                            as={Fragment}
                            enter="transform ease-out duration-300 transition"
                            enterFrom="translate-y-2 opacity-0 sm:translate-y-0 sm:translate-x-2"
                            enterTo="translate-y-0 opacity-100 sm:translate-x-0"
                            leave="transition ease-in duration-100"
                            leaveFrom="opacity-100"
                            leaveTo="opacity-0"
                        >
                            <div
                                className="pointer-events-auto w-full max-w-sm overflow-hidden rounded-lg bg-white shadow-lg ring-1 ring-black ring-opacity-5">
                                <div className="p-4">
                                    <div className="flex items-start">
                                        <div className="flex-shrink-0">
                                            <CheckCircleIcon className="h-6 w-6 text-green-400" aria-hidden="true"/>
                                        </div>
                                        <div className="ml-3 w-0 flex-1 pt-0.5">
                                            <p className="text-sm font-medium text-gray-900">{toastVisible.title}!</p>
                                            {toastVisible?.subtitle && (
                                                <p className="mt-1 text-sm text-gray-500">
                                                    {toastVisible.subtitle}
                                                </p>
                                            )}
                                        </div>
                                        <div className="ml-4 flex flex-shrink-0">
                                            <button
                                                type="button"
                                                className="inline-flex rounded-md bg-white text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                                                onClick={dismissToast}
                                            >
                                                <span className="sr-only">Close</span>
                                                <XMarkIcon className="h-5 w-5" aria-hidden="true"/>
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </Transition>
                    </div>
                </div>, document.body
            )}
        </ToastContext.Provider>
    )
}

export default ToastProvider
