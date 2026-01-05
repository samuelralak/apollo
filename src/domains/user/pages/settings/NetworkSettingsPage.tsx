import {ExclamationTriangleIcon} from "@heroicons/react/20/solid";

const NetworkSettingsPage = () => {
    return (
        <div className="mx-auto max-w-2xl space-y-16 sm:space-y-20 lg:mx-0 lg:max-w-none">
            <div>
                <h2 className="text-base font-semibold leading-7 text-slate-900 dark:text-slate-100">Network</h2>
                <p className="mt-1 text-sm leading-6 text-slate-500 dark:text-slate-400 mb-5">
                    {/* Some description text.. */}
                </p>

                <div className="border-l-4 border-yellow-400 dark:border-yellow-500 bg-yellow-50 dark:bg-yellow-900/30 p-4">
                    <div className="flex">
                        <div className="flex-shrink-0">
                            <ExclamationTriangleIcon className="h-5 w-5 text-yellow-500 dark:text-yellow-400" aria-hidden="true"/>
                        </div>
                        <div className="ml-3">
                            <p className="text-sm text-yellow-700 dark:text-yellow-300">
                                Nothing to see here yet! Stay tuned...
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default NetworkSettingsPage
