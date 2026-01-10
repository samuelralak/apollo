import { Dialog, DialogPanel, DialogBackdrop } from "@headlessui/react";
import { useState, useCallback, useRef, useContext, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router";
import { useDebouncedEffect, useIsMounted } from "@react-hookz/web";
import { HugeiconsIcon } from "@hugeicons/react";
import { Search01Icon, Cancel01Icon, UserIcon, CommandIcon } from "@hugeicons-pro/core-solid-rounded";
import { HelpCircleIcon, HashtagIcon } from "@hugeicons-pro/core-duotone-rounded";
import type { NDKKind } from "@nostr-dev-kit/ndk";
import { NDKRelaySet } from "@nostr-dev-kit/ndk";
import { AppDispatch, RootState } from "../../../app/store";
import { hidePortal } from "../../store/portal.slice";
import { NDKContext } from "../../../lib/ndk/NDKProvider";
import constants from "../../../constants";
import { questionTransformer } from "../../../domains/question/services/question.transformer";
import { classNames, markdownToText } from "../../../utils";

type SearchTab = 'all' | 'questions' | 'users' | 'tags';

interface SearchResult {
    id: string;
    type: 'question' | 'user' | 'tag';
    title: string;
    subtitle?: string;
    image?: string;
    url: string;
    pubkey?: string;
}

const TABS: { id: SearchTab; label: string }[] = [
    { id: 'all', label: 'All' },
    { id: 'questions', label: 'Questions' },
    { id: 'users', label: 'Users' },
    { id: 'tags', label: 'Tags' },
];

const SearchPortal = () => {
    const dispatch = useDispatch<AppDispatch>();
    const navigate = useNavigate();
    const { visible } = useSelector((state: RootState) => state.portal);
    const { ndkInstance } = useContext(NDKContext) as NDKContext;
    const isMounted = useIsMounted();

    const inputRef = useRef<HTMLInputElement>(null);
    const [query, setQuery] = useState('');
    const [activeTab, setActiveTab] = useState<SearchTab>('all');
    const [results, setResults] = useState<SearchResult[]>([]);
    const [loading, setLoading] = useState(false);
    const [selectedIndex, setSelectedIndex] = useState(0);

    // Race condition fix: Track the latest request ID
    const searchRequestId = useRef(0);

    const existingQuestions = useSelector((state: RootState) => state.question.data);

    const isMac = useMemo(() =>
        typeof navigator !== 'undefined' && navigator.platform.toUpperCase().indexOf('MAC') >= 0,
    []);

    const handleClose = useCallback(() => {
        dispatch(hidePortal());
        setQuery('');
        setResults([]);
        setSelectedIndex(0);
        setActiveTab('all');
    }, [dispatch]);

    const handleResultClick = useCallback((result: SearchResult) => {
        handleClose();
        navigate(result.url);
    }, [handleClose, navigate]);

    const performSearch = useCallback(async (searchQuery: string, tab: SearchTab) => {
        const trimmedQuery = searchQuery.trim();

        if (!trimmedQuery || trimmedQuery.length < 2) {
            setResults([]);
            setLoading(false);
            return;
        }

        // Increment ID for this new search to handle race conditions
        const currentRequestId = ++searchRequestId.current;
        setLoading(true);

        const ndk = ndkInstance();
        const searchRelaySet = NDKRelaySet.fromRelayUrls(constants.searchRelays, ndk);
        const allResults: SearchResult[] = [];

        // Search Questions
        if (tab === 'all' || tab === 'questions') {
            try {
                const limit = tab === 'questions' ? 15 : 8;
                const questionEvents = await ndk.fetchEvents({
                    kinds: [constants.questionKind as NDKKind],
                    search: trimmedQuery,
                    limit
                }, { closeOnEose: true }, searchRelaySet);

                for (const event of questionEvents) {
                    try {
                        const question = questionTransformer(event);
                        allResults.push({
                            id: question.id,
                            type: 'question',
                            title: question.title,
                            subtitle: markdownToText(question.description).slice(0, 80),
                            url: `/questions/${question.id}`,
                        });
                    } catch {
                        // Skip malformed question events
                    }
                }
            } catch (e) {
                console.warn("Questions search failed", e);
            }
        }

        // Search Users
        if (tab === 'all' || tab === 'users') {
            try {
                const limit = tab === 'users' ? 15 : 5;
                const userEvents = await ndk.fetchEvents({
                    kinds: [0 as NDKKind],
                    search: trimmedQuery,
                    limit
                }, { closeOnEose: true }, searchRelaySet);

                const seenPubkeys = new Set<string>();

                for (const event of userEvents) {
                    if (seenPubkeys.has(event.pubkey)) continue;

                    try {
                        const profile = JSON.parse(event.content);
                        seenPubkeys.add(event.pubkey);

                        allResults.push({
                            id: event.pubkey,
                            type: 'user',
                            title: profile.name || profile.display_name || 'Anonymous',
                            subtitle: profile.nip05 || `${event.pubkey.slice(0, 12)}...`,
                            image: profile.image || profile.picture,
                            url: `/user/${event.pubkey}`,
                            pubkey: event.pubkey,
                        });
                    } catch {
                        // Skip malformed profiles
                    }
                }
            } catch (e) {
                console.warn("Users search failed", e);
            }
        }

        // Search Tags (client-side from existing questions)
        if (tab === 'all' || tab === 'tags') {
            const tagCounts = new Map<string, number>();
            const lowerQuery = trimmedQuery.toLowerCase();

            Object.values(existingQuestions).forEach((question) => {
                question.tags?.forEach((tag) => {
                    if (tag.toLowerCase().includes(lowerQuery)) {
                        tagCounts.set(tag, (tagCounts.get(tag) || 0) + 1);
                    }
                });
            });

            const sortedTags = Array.from(tagCounts.entries())
                .sort((a, b) => b[1] - a[1])
                .slice(0, tab === 'tags' ? 15 : 3);

            for (const [tag, count] of sortedTags) {
                allResults.push({
                    id: `tag-${tag}`,
                    type: 'tag',
                    title: tag,
                    subtitle: `${count} question${count !== 1 ? 's' : ''}`,
                    url: `/questions?tag=${encodeURIComponent(tag)}`,
                });
            }
        }

        // Race condition check: Only update state if this is still the latest request
        if (isMounted() && currentRequestId === searchRequestId.current) {
            setResults(allResults);
            setSelectedIndex(0);
            setLoading(false);
        }
    }, [ndkInstance, existingQuestions, isMounted]);

    useDebouncedEffect(
        () => { performSearch(query, activeTab); },
        [query, activeTab],
        400
    );

    const handleTabChange = (tab: SearchTab) => {
        setActiveTab(tab);
        setSelectedIndex(0);
    };

    const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
        if (e.key === 'ArrowDown') {
            e.preventDefault();
            setSelectedIndex(prev => Math.min(prev + 1, results.length - 1));
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            setSelectedIndex(prev => Math.max(prev - 1, 0));
        } else if (e.key === 'Enter' && results[selectedIndex]) {
            e.preventDefault();
            handleResultClick(results[selectedIndex]);
        } else if (e.key === 'Tab' && !e.shiftKey) {
            e.preventDefault();
            const currentIndex = TABS.findIndex(t => t.id === activeTab);
            const nextIndex = (currentIndex + 1) % TABS.length;
            handleTabChange(TABS[nextIndex].id);
        }
    }, [results, selectedIndex, activeTab, handleResultClick]);

    const getResultIcon = (type: SearchResult['type'], image?: string) => {
        if (type === 'user') {
            if (image) {
                return (
                    <img
                        src={image}
                        alt=""
                        className="h-10 w-10 rounded-full object-cover"
                        onError={(e) => {
                            (e.target as HTMLImageElement).style.display = 'none';
                        }}
                    />
                );
            }
            return (
                <div className="h-10 w-10 rounded-full bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center">
                    <HugeiconsIcon icon={UserIcon} size={20} className="text-blue-500 dark:text-blue-400" />
                </div>
            );
        }
        if (type === 'question') {
            return (
                <div className="h-10 w-10 rounded-lg bg-teal-50 dark:bg-teal-900/20 flex items-center justify-center">
                    <HugeiconsIcon icon={HelpCircleIcon} size={20} className="text-teal-600 dark:text-teal-400" />
                </div>
            );
        }
        return (
            <div className="h-10 w-10 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                <HugeiconsIcon icon={HashtagIcon} size={20} className="text-slate-500 dark:text-slate-400" />
            </div>
        );
    };

    return (
        <Dialog
            open={visible}
            onClose={handleClose}
            className="relative z-50"
            initialFocus={inputRef}
        >
            <DialogBackdrop
                transition
                className="fixed inset-0 bg-slate-950/50 backdrop-blur-sm transition-opacity duration-200 data-closed:opacity-0"
            />

            <div className="fixed inset-0 z-50 overflow-y-auto">
                <div className="flex min-h-full items-start justify-center px-4 pt-[15vh] sm:pt-[12vh]">
                    <DialogPanel
                        transition
                        className={classNames(
                            "w-full bg-white dark:bg-slate-900 shadow-2xl overflow-hidden",
                            "ring-1 ring-slate-900/10 dark:ring-white/10",
                            "transition-all duration-200 ease-out",
                            "data-closed:opacity-0 data-closed:scale-[0.98] data-closed:-translate-y-2",
                            "sm:max-w-xl sm:rounded-2xl",
                            "max-sm:fixed max-sm:inset-x-0 max-sm:top-0 max-sm:bottom-0 max-sm:rounded-none"
                        )}
                        onKeyDown={handleKeyDown}
                    >
                        {/* Search Input */}
                        <div className="flex items-center gap-3 px-4 sm:px-5 py-4">
                            <HugeiconsIcon
                                icon={Search01Icon}
                                size={22}
                                className={classNames(
                                    "flex-shrink-0 transition-colors",
                                    loading ? "text-teal-500 dark:text-teal-400" : "text-slate-400 dark:text-slate-500"
                                )}
                            />
                            <input
                                ref={inputRef}
                                type="text"
                                value={query}
                                onChange={(e) => setQuery(e.target.value)}
                                placeholder="Search..."
                                className="flex-1 bg-transparent border-0 outline-none ring-0 focus:ring-0 focus:outline-none text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 text-lg font-medium"
                            />
                            {query && (
                                <button
                                    onClick={() => setQuery('')}
                                    className="p-1.5 rounded-md text-slate-400 hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors flex-shrink-0"
                                >
                                    <HugeiconsIcon icon={Cancel01Icon} size={16} />
                                </button>
                            )}
                            <button
                                onClick={handleClose}
                                className="flex-shrink-0 text-xs font-medium text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300"
                            >
                                <span className="hidden sm:inline px-1.5 py-1 rounded bg-slate-100 dark:bg-slate-800 font-mono">esc</span>
                                <span className="sm:hidden">Cancel</span>
                            </button>
                        </div>

                        {/* Tabs */}
                        <div className="flex gap-1 px-4 sm:px-5 pb-3">
                            {TABS.map((tab) => (
                                <button
                                    key={tab.id}
                                    onClick={() => handleTabChange(tab.id)}
                                    className={classNames(
                                        "px-2.5 py-1 text-xs font-medium rounded-full transition-colors",
                                        activeTab === tab.id
                                            ? "bg-teal-100 dark:bg-teal-900/40 text-teal-700 dark:text-teal-300"
                                            : "text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
                                    )}
                                >
                                    {tab.label}
                                </button>
                            ))}
                        </div>

                        <div className="h-px bg-slate-200 dark:bg-slate-800" />

                        {/* Results */}
                        <div className="max-h-[50vh] sm:max-h-80 overflow-y-auto overscroll-contain">
                            {/* Loading */}
                            {loading && results.length === 0 && (
                                <div className="px-5 py-12 text-center">
                                    <div className="h-5 w-5 border-2 border-slate-200 dark:border-slate-700 border-t-teal-500 rounded-full animate-spin mx-auto" />
                                </div>
                            )}

                            {/* Empty - Start typing */}
                            {!loading && results.length === 0 && query.trim().length < 2 && (
                                <div className="px-5 py-12 text-center">
                                    <p className="text-sm text-slate-500 dark:text-slate-400">
                                        Type to search questions, users, and tags
                                    </p>
                                </div>
                            )}

                            {/* Empty - No results */}
                            {!loading && results.length === 0 && query.trim().length >= 2 && (
                                <div className="px-5 py-12 text-center">
                                    <p className="text-sm font-medium text-slate-600 dark:text-slate-300">No results for "{query}"</p>
                                    <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">Try different keywords</p>
                                </div>
                            )}

                            {/* Results List */}
                            {results.length > 0 && (
                                <div className="py-2">
                                    {results.map((result, index) => (
                                        <button
                                            key={result.id}
                                            onClick={() => handleResultClick(result)}
                                            className={classNames(
                                                "w-full flex items-center gap-3 px-4 sm:px-5 py-2.5 text-left transition-colors",
                                                index === selectedIndex
                                                    ? "bg-slate-100 dark:bg-slate-800"
                                                    : "hover:bg-slate-50 dark:hover:bg-slate-800/50"
                                            )}
                                        >
                                            <div className="flex-shrink-0">
                                                {getResultIcon(result.type, result.image)}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-medium text-slate-900 dark:text-slate-100 truncate">
                                                    {result.title}
                                                </p>
                                                {result.subtitle && (
                                                    <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                                                        {result.subtitle}
                                                    </p>
                                                )}
                                            </div>
                                            {index === selectedIndex && (
                                                <span className="hidden sm:block flex-shrink-0 text-[10px] font-medium text-slate-400 dark:text-slate-500 px-1.5 py-0.5 rounded bg-slate-200 dark:bg-slate-700">
                                                    ↵
                                                </span>
                                            )}
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Footer */}
                        <div className="hidden sm:flex items-center justify-between px-5 py-3 text-xs text-slate-500 dark:text-slate-400 border-t border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50">
                            <div className="flex items-center gap-5">
                                <span className="flex items-center gap-1.5">
                                    <span className="font-semibold">↑↓</span> navigate
                                </span>
                                <span className="flex items-center gap-1.5">
                                    <span className="font-semibold">tab</span> filter
                                </span>
                                <span className="flex items-center gap-1.5">
                                    <span className="font-semibold">↵</span> select
                                </span>
                            </div>
                            <span className="flex items-center gap-1">
                                {isMac ? (
                                    <HugeiconsIcon icon={CommandIcon} size={14} />
                                ) : (
                                    <span className="font-semibold">Ctrl</span>
                                )}
                                <span className="font-semibold">K</span>
                                <span className="ml-1">toggle</span>
                            </span>
                        </div>
                    </DialogPanel>
                </div>
            </div>
        </Dialog>
    );
};

export default SearchPortal;
