import {Dialog, DialogPanel, DialogBackdrop} from "@headlessui/react";
import {HugeiconsIcon} from "@hugeicons/react";
import {
    Cancel01Icon,
    Database01Icon,
    ShieldUserIcon,
    BitcoinEllipseIcon,
    FlashIcon,
    ArrowRight01Icon
} from "@hugeicons-pro/core-duotone-rounded";
import {Link} from "react-router";

interface WelcomePortalProps {
    visible: boolean;
    onClose: () => void;
}

const WelcomePortal = ({visible, onClose}: WelcomePortalProps) => {
    return (
        <Dialog open={visible} onClose={onClose} className="relative z-10">
            <DialogBackdrop
                transition
                className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity duration-300 ease-out data-closed:opacity-0"
            />

            <div className="fixed inset-0 z-10 w-screen overflow-y-auto">
                <div className="flex min-h-full justify-center p-4 text-center items-center">
                    <DialogPanel
                        transition
                        className="relative transform overflow-hidden rounded-2xl bg-white dark:bg-slate-800 p-6 text-left shadow-xl ring-1 ring-slate-200 dark:ring-slate-700 transition-all duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] w-full max-w-sm data-closed:opacity-0 data-closed:scale-95 data-closed:-translate-y-4"
                    >
                        {/* Close button */}
                        <button
                            type="button"
                            onClick={onClose}
                            className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
                        >
                            <HugeiconsIcon icon={Cancel01Icon} size={18} />
                        </button>

                        {/* Header - left aligned, not centered */}
                        <div className="mb-5">
                            <p className="text-xs font-medium text-teal-600 dark:text-teal-400 tracking-wide uppercase mb-1">
                                Welcome to
                            </p>
                            <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                                Apollo
                            </h1>
                        </div>

                        {/* Single compelling statement */}
                        <p className="text-slate-600 dark:text-slate-400 mb-6">
                            Q&A that pays you in Bitcoin. Your content, your keys, your rules.
                        </p>

                        {/* Compact value hints - inline style */}
                        <div className="flex flex-wrap gap-3 mb-6 text-xs">
                            <span className="inline-flex items-center gap-1.5 text-slate-600 dark:text-slate-400">
                                <HugeiconsIcon icon={Database01Icon} size={14} className="text-teal-500" />
                                Own your data
                            </span>
                            <span className="inline-flex items-center gap-1.5 text-slate-600 dark:text-slate-400">
                                <HugeiconsIcon icon={ShieldUserIcon} size={14} className="text-purple-500" />
                                No censorship
                            </span>
                            <span className="inline-flex items-center gap-1.5 text-slate-600 dark:text-slate-400">
                                <HugeiconsIcon icon={BitcoinEllipseIcon} size={14} className="text-amber-500" />
                                <HugeiconsIcon icon={FlashIcon} size={12} className="text-amber-400 -ml-1" />
                                Earn sats
                            </span>
                        </div>

                        {/* Actions - primary is prominent */}
                        <div className="space-y-2">
                            <button
                                type="button"
                                onClick={onClose}
                                className="group w-full inline-flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg bg-teal-600 hover:bg-teal-700 text-white font-medium transition-colors text-sm"
                            >
                                Start exploring
                                <HugeiconsIcon icon={ArrowRight01Icon} size={16} className="transition-transform group-hover:translate-x-0.5" />
                            </button>
                            <Link
                                to="/about"
                                onClick={onClose}
                                className="block w-full py-2.5 px-4 text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 text-sm text-center transition-colors"
                            >
                                Learn more about Apollo
                            </Link>
                        </div>
                    </DialogPanel>
                </div>
            </div>
        </Dialog>
    );
};

export default WelcomePortal;
