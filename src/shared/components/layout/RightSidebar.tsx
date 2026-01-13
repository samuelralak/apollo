import { useMemo } from "react";
import { Link } from "react-router";
import { useDispatch } from "react-redux";
import { HugeiconsIcon } from "@hugeicons/react";
import { Github01Icon, Search01Icon, BitcoinEllipseIcon, FlashIcon, CopyrightIcon } from "@hugeicons-pro/core-duotone-rounded";
import { CommandIcon } from "@hugeicons-pro/core-solid-rounded";
import type { AppDispatch } from "../../../app/store";
import { showPortal, PortalID } from "../../store/portal.slice";
import { classNames } from "../../../utils";

interface RightSidebarProps {
    className?: string;
}

const RightSidebar = ({ className }: RightSidebarProps) => {
    const dispatch = useDispatch<AppDispatch>();
    const currentYear = new Date().getFullYear();

    const isMac = useMemo(() =>
        typeof navigator !== 'undefined' && navigator.platform.toUpperCase().indexOf('MAC') >= 0,
    []);

    const openSearch = () => {
        dispatch(showPortal({ portalId: PortalID.search }));
    };

    return (
        <aside
            className={classNames(
                "w-[300px] shrink-0",
                "h-screen sticky top-0",
                "flex flex-col",
                "pl-6 pr-4 py-4",
                className
            )}
        >
            {/* Search input */}
            <button
                type="button"
                onClick={openSearch}
                className={classNames(
                    "flex items-center gap-3 w-full px-3 py-2",
                    "rounded-lg",
                    "border border-slate-200 dark:border-slate-700",
                    "bg-slate-100 dark:bg-slate-800/50",
                    "text-slate-400 dark:text-slate-500",
                    "hover:border-slate-300 dark:hover:border-slate-700",
                    "hover:bg-slate-100 dark:hover:bg-slate-800",
                    "transition-colors"
                )}
            >
                <HugeiconsIcon icon={Search01Icon} size={16} />
                <span className="flex-1 text-sm text-left">Search...</span>
                <span className="flex items-center gap-0.5">
                    {isMac ? (
                        <HugeiconsIcon icon={CommandIcon} size={14} />
                    ) : (
                        <span className="text-xs font-medium">Ctrl</span>
                    )}
                    <span className="text-sm font-semibold">K</span>
                </span>
            </button>

            {/* Spacer to push footer to bottom */}
            <div className="flex-1" />

            {/* Footer */}
            <footer className="text-[13px] text-slate-500 dark:text-slate-400">
                <nav className="flex flex-wrap gap-x-4 gap-y-1 mb-4">
                    <Link to="/about" className="hover:underline">About</Link>
                    <Link to="/terms" className="hover:underline">Terms</Link>
                    <Link to="/privacy" className="hover:underline">Privacy</Link>
                    <a
                        href="https://github.com/samuelralak/apollo"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 hover:underline"
                    >
                        <HugeiconsIcon icon={Github01Icon} size={13} />
                        GitHub
                    </a>
                </nav>

                <p className="mb-2 text-slate-400 dark:text-slate-500">
                    <HugeiconsIcon icon={CopyrightIcon} size={13} className="inline-block align-middle mr-0.5" />
                    {currentYear} Apollo. Open source under AGPL-3.0. Built on The Bitcoin Standard.
                </p>
                <p className="flex items-center gap-1 text-slate-400 dark:text-slate-500">
                    <span className="text-purple-500 font-medium">NOSTR</span>
                    <span>+</span>
                    <HugeiconsIcon icon={BitcoinEllipseIcon} size={16} className="text-amber-500" />
                    <HugeiconsIcon icon={FlashIcon} size={13} className="text-amber-400 -ml-0.5" />
                </p>
            </footer>
        </aside>
    );
};

export default RightSidebar;
