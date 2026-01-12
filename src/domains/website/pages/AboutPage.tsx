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
            <section className="py-12 sm:py-16">
                <p className="text-sm font-medium text-teal-600 dark:text-teal-400 mb-3">
                    Community Q&A on Nostr
                </p>
                <h1 className="text-4xl sm:text-5xl font-bold text-slate-900 dark:text-slate-100 mb-4">
                    Q&A without the middleman.
                </h1>
                <p className="text-lg text-slate-600 dark:text-slate-400 max-w-xl">
                    Ask questions. Share what you know. Get paid in Bitcoin for being helpful.
                </p>
            </section>

            <section className="py-10 border-t border-slate-200 dark:border-slate-700">
                <p className="text-slate-600 dark:text-slate-400 text-lg leading-relaxed mb-6">
                    Traditional Q&A platforms store your content on their servers, censor what they don't like,
                    and reward you with imaginary points while they profit from your contributions.
                </p>
                <p className="text-slate-900 dark:text-slate-100 text-xl font-medium">
                    We think you deserve better.
                </p>
            </section>

            <section className="py-10 grid gap-6 sm:grid-cols-2">
                <div className="flex gap-3">
                    <HugeiconsIcon icon={Database01Icon} size={18} className="text-teal-600 dark:text-teal-400 shrink-0 mt-1" />
                    <div>
                        <h3 className="font-medium text-slate-900 dark:text-slate-100 leading-snug">You own your data</h3>
                        <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                            Your content lives on relays you choose. No lock-in.
                        </p>
                    </div>
                </div>
                <div className="flex gap-3">
                    <HugeiconsIcon icon={ShieldUserIcon} size={18} className="text-teal-600 dark:text-teal-400 shrink-0 mt-1" />
                    <div>
                        <h3 className="font-medium text-slate-900 dark:text-slate-100 leading-snug">Censorship-resistant</h3>
                        <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                            No central authority decides what you can say.
                        </p>
                    </div>
                </div>
                <div className="flex gap-3">
                    <HugeiconsIcon icon={BitcoinEllipseIcon} size={18} className="text-amber-500 shrink-0 mt-1" />
                    <div>
                        <h3 className="font-medium text-slate-900 dark:text-slate-100 leading-snug">Earn sats for helping</h3>
                        <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                            Real Bitcoin tips via Lightning. Not points.
                        </p>
                    </div>
                </div>
                <div className="flex gap-3">
                    <HugeiconsIcon icon={FingerPrintIcon} size={18} className="text-teal-600 dark:text-teal-400 shrink-0 mt-1" />
                    <div>
                        <h3 className="font-medium text-slate-900 dark:text-slate-100 leading-snug">One identity, everywhere</h3>
                        <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                            Your Nostr keys work across hundreds of apps.
                        </p>
                    </div>
                </div>
            </section>

            <section className="py-10">
                <div className="px-5 py-4 rounded-lg bg-slate-50 dark:bg-slate-800/50">
                    <p className="text-slate-700 dark:text-slate-300 text-sm font-medium mb-1">
                        Why "Apollo"?
                    </p>
                    <p className="text-slate-500 dark:text-slate-400 text-sm">
                        Named after the Greek god of knowledge and truth — a fitting name for a place where questions find answers.
                    </p>
                </div>
            </section>

            <section className="py-8">
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
