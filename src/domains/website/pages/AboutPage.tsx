import {Link} from "react-router";
import {HugeiconsIcon} from "@hugeicons/react";
import {
    Database01Icon,
    ShieldUserIcon,
    BitcoinEllipseIcon,
    FingerPrintIcon,
    ArrowRight01Icon
} from "@hugeicons-pro/core-duotone-rounded";

const AboutPage = () => {
    return (
        <div className="max-w-3xl mx-auto">
            {/* Hero - asymmetric, less centered */}
            <section className="py-12 sm:py-16">
                <p className="text-sm font-medium text-teal-600 dark:text-teal-400 tracking-wide uppercase mb-3">
                    Community Q&A on NOSTR
                </p>
                <h1 className="text-4xl sm:text-5xl font-bold text-slate-900 dark:text-slate-100 mb-4">
                    Knowledge sharing,<br />
                    <span className="text-teal-600 dark:text-teal-400">truly yours.</span>
                </h1>
                <p className="text-lg text-slate-600 dark:text-slate-400 max-w-xl">
                    Ask questions. Share what you know. Get paid in Bitcoin for being helpful.
                </p>
            </section>

            {/* The shift - prose style, not cards */}
            <section className="py-10 border-t border-slate-200 dark:border-slate-700">
                <p className="text-slate-600 dark:text-slate-400 text-lg leading-relaxed mb-6">
                    Traditional Q&A platforms store your content on their servers, censor what they don't like,
                    and reward you with imaginary points while they profit from your contributions.
                </p>
                <p className="text-slate-900 dark:text-slate-100 text-xl font-medium">
                    We think you deserve better.
                </p>
            </section>

            {/* Value props - varied layout, not uniform grid */}
            <section className="py-10">
                {/* Featured value - full width */}
                <div className="mb-8 p-6 sm:p-8 rounded-2xl bg-gradient-to-br from-teal-50 to-teal-100/50 dark:from-teal-900/20 dark:to-teal-800/10 border border-teal-200/50 dark:border-teal-700/30">
                    <div className="flex items-center gap-3 mb-3">
                        <HugeiconsIcon icon={Database01Icon} size={22} className="text-teal-600 dark:text-teal-400" />
                        <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">You own your data</h3>
                    </div>
                    <p className="text-slate-600 dark:text-slate-400">
                        Built on NOSTR, your content lives on relays you choose. No lock-in.
                        No platform can delete what's yours.
                    </p>
                </div>

                {/* Secondary values - compact list */}
                <div className="space-y-4">
                    <div className="flex gap-4 items-start">
                        <div className="shrink-0 mt-1">
                            <HugeiconsIcon icon={ShieldUserIcon} size={20} className="text-purple-600 dark:text-purple-400" />
                        </div>
                        <div>
                            <h3 className="font-medium text-slate-900 dark:text-slate-100">Censorship-resistant</h3>
                            <p className="text-sm text-slate-600 dark:text-slate-400">No central authority decides what you can say.</p>
                        </div>
                    </div>
                    <div className="flex gap-4 items-start">
                        <div className="shrink-0 mt-1">
                            <HugeiconsIcon icon={BitcoinEllipseIcon} size={20} className="text-amber-500" />
                        </div>
                        <div>
                            <h3 className="font-medium text-slate-900 dark:text-slate-100">Earn sats for helping</h3>
                            <p className="text-sm text-slate-600 dark:text-slate-400">Real Bitcoin tips via Lightning. Not points. Money.</p>
                        </div>
                    </div>
                    <div className="flex gap-4 items-start">
                        <div className="shrink-0 mt-1">
                            <HugeiconsIcon icon={FingerPrintIcon} size={20} className="text-slate-600 dark:text-slate-400" />
                        </div>
                        <div>
                            <h3 className="font-medium text-slate-900 dark:text-slate-100">One identity, everywhere</h3>
                            <p className="text-sm text-slate-600 dark:text-slate-400">Your NOSTR keys work across hundreds of apps.</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Why Apollo - aside/callout style */}
            <aside className="py-8 my-6 border-l-4 border-amber-400 dark:border-amber-500 pl-6">
                <p className="text-slate-600 dark:text-slate-400 italic mb-2">
                    "Apollo was the Greek god of knowledge, truth, and enlightenment."
                </p>
                <p className="text-sm text-slate-500 dark:text-slate-500">
                    A fitting name for a place where questions find answers.
                </p>
            </aside>

            {/* CTA - more prominent */}
            <section className="py-12">
                <div className="flex flex-col sm:flex-row gap-4">
                    <Link
                        to="/"
                        className="group inline-flex items-center justify-center gap-2 px-6 py-3 rounded-lg bg-teal-600 hover:bg-teal-700 text-white font-medium transition-colors"
                    >
                        Start browsing
                        <HugeiconsIcon icon={ArrowRight01Icon} size={18} className="transition-transform group-hover:translate-x-0.5" />
                    </Link>
                    <Link
                        to="/questions/new"
                        className="inline-flex items-center justify-center px-6 py-3 rounded-lg border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 font-medium transition-colors"
                    >
                        Ask a question
                    </Link>
                </div>
            </section>

        </div>
    );
};

export default AboutPage;
