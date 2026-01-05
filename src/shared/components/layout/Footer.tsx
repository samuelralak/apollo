import {Link} from "react-router";
import {HugeiconsIcon} from "@hugeicons/react";
import {BitcoinEllipseIcon, FlashIcon, Github01Icon} from "@hugeicons-pro/core-duotone-rounded";

const Footer = () => {
    const currentYear = new Date().getFullYear();

    return (
        <footer className="bg-slate-50 dark:bg-slate-900/50">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    {/* Branding */}
                    <div className="flex items-center gap-3">
                        <span className="font-bold font-['Poppins'] text-slate-700 dark:text-slate-300">[APOLLO]</span>
                        <span className="text-slate-300 dark:text-slate-600">|</span>
                        <div className="flex items-center gap-1 text-xs text-slate-500 dark:text-slate-400">
                            <span className="text-purple-600 dark:text-purple-400 font-medium">NOSTR</span>
                            <span>+</span>
                            <HugeiconsIcon icon={BitcoinEllipseIcon} size={14} className="text-amber-500" />
                            <HugeiconsIcon icon={FlashIcon} size={11} className="text-amber-400 -ml-0.5" />
                        </div>
                    </div>

                    {/* Links */}
                    <nav className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm">
                        <Link
                            to="/about"
                            className="text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 transition-colors"
                        >
                            About
                        </Link>
                        <Link
                            to="/privacy"
                            className="text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 transition-colors"
                        >
                            Privacy
                        </Link>
                        <Link
                            to="/terms"
                            className="text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 transition-colors"
                        >
                            Terms
                        </Link>
                        <a
                            href="https://github.com/anthropics/apollo"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 transition-colors"
                        >
                            <HugeiconsIcon icon={Github01Icon} size={16} />
                            <span>GitHub</span>
                        </a>
                    </nav>
                </div>

                {/* Copyright */}
                <div className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-800">
                    <p className="text-xs text-slate-400 dark:text-slate-500">
                        © {currentYear} Apollo. Open source under AGPL-3.0. Built on The Bitcoin Standard.
                    </p>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
