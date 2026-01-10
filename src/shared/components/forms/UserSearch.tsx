import { useContext, useState, useCallback } from 'react'
import { Combobox, ComboboxInput, ComboboxButton, ComboboxOptions, ComboboxOption } from '@headlessui/react'
import { useToggle, useDebouncedEffect, useIsMounted } from '@react-hookz/web'
import { HugeiconsIcon } from "@hugeicons/react"
import { Search01Icon, Tick02Icon, UserIcon } from "@hugeicons-pro/core-solid-rounded"
import { NDKContext } from "../../../lib/ndk/NDKProvider"
import { NDKUser, NDKRelaySet } from "@nostr-dev-kit/ndk"
import { classNames } from "../../../utils"
import constants from "../../../constants"

interface UserSearchProps {
    onSelect: (user: NDKUser) => void
    excludePubkeys?: string[]
}

// Truncate npub for display
const truncateNpub = (pubkey: string): string => {
    try {
        const npub = `npub1${pubkey.slice(0, 8)}...${pubkey.slice(-4)}`
        return npub
    } catch {
        return pubkey.slice(0, 12) + '...'
    }
}

export default function UserSearch({ onSelect, excludePubkeys = [] }: UserSearchProps) {
    const { ndkInstance } = useContext(NDKContext) as NDKContext
    const [query, setQuery] = useState('')
    const [users, setUsers] = useState<NDKUser[]>([])
    const [loading, setLoading] = useState(false)
    const [isFocused, toggleFocus] = useToggle(false)
    const isMounted = useIsMounted()

    // Memoized search function
    const performSearch = useCallback(async (searchQuery: string) => {
        if (!searchQuery || searchQuery.length < 3) {
            setUsers([])
            return
        }

        setLoading(true)
        const ndk = ndkInstance()

        try {
            // 1. Check for NPUB/NPROFILE
            if (searchQuery.startsWith('npub1') || searchQuery.startsWith('nprofile1')) {
                try {
                    const user = ndk.getUser({ npub: searchQuery })
                    await user.fetchProfile()
                    if (isMounted()) {
                        setUsers([user])
                        setLoading(false)
                    }
                    return
                } catch {
                    // Invalid encoding, fall through to text search
                }
            }

            // 2. Text Search (NIP-50) via dedicated search relays
            const searchRelaySet = NDKRelaySet.fromRelayUrls(constants.searchRelays, ndk)

            const searchPromise = ndk.fetchEvents({
                kinds: [0],
                search: searchQuery,
                limit: 15
            }, {
                closeOnEose: true,
            }, searchRelaySet)

            // Add timeout to prevent hanging
            const timeoutPromise = new Promise<never>((_, reject) => {
                setTimeout(() => reject(new Error('Search timeout')), 5000)
            })

            const events = await Promise.race([searchPromise, timeoutPromise])

            if (!isMounted()) return

            // Deduplicate by pubkey using Map
            const uniqueUsers = new Map<string, NDKUser>()

            for (const event of events) {
                if (excludePubkeys.includes(event.pubkey)) continue
                if (uniqueUsers.has(event.pubkey)) continue

                const user = ndk.getUser({ pubkey: event.pubkey })

                // Hydrate profile safely
                try {
                    const content = JSON.parse(event.content)
                    user.profile = content
                    uniqueUsers.set(event.pubkey, user)
                } catch {
                    // Skip malformed profile content
                }
            }

            setUsers(Array.from(uniqueUsers.values()))

        } catch (error) {
            if (isMounted()) {
                console.error("Search failed:", error)
                setUsers([])
            }
        } finally {
            if (isMounted()) {
                setLoading(false)
            }
        }
    }, [ndkInstance, excludePubkeys, isMounted])

    // Debounced search effect - automatically handles timing and cleanup
    useDebouncedEffect(
        () => { performSearch(query) },
        [query, performSearch],
        400
    )

    const handleSelect = (user: NDKUser | null) => {
        if (!user) return
        onSelect(user)
        setQuery('')
    }

    const showDropdown = isFocused && (users.length > 0 || query.length >= 3)

    return (
        <div className="w-full relative z-20">
            <Combobox value={null} onChange={handleSelect}>
                <div className="relative">
                    {/* Input Container - matches TitleInput/TagsInput pattern */}
                    <div
                        className={classNames(
                            isFocused ? "bg-white dark:bg-slate-700 ring-teal-600 dark:ring-teal-500" : "bg-slate-100 dark:bg-slate-800 ring-slate-200 dark:ring-slate-700",
                            "relative w-full overflow-hidden rounded-lg ring-2 transition-colors"
                        )}
                    >
                        {/* Search Icon */}
                        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                            <HugeiconsIcon
                                icon={Search01Icon}
                                size={18}
                                className={classNames(
                                    isFocused ? "text-teal-600 dark:text-teal-400" : "text-slate-400 dark:text-slate-500",
                                    "transition-colors"
                                )}
                            />
                        </div>

                        <ComboboxInput
                            className="w-full border-none py-3 pl-10 pr-10 bg-transparent text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:ring-0 focus:outline-none leading-6"
                            value={query}
                            onChange={(event) => setQuery(event.target.value)}
                            onFocus={() => toggleFocus(true)}
                            onBlur={() => toggleFocus(false)}
                            placeholder="Search by name or paste npub..."
                            aria-label="Search for users"
                        />

                        {/* Loading Indicator */}
                        <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                            {loading ? (
                                <div className="h-4 w-4 border-2 border-teal-500 dark:border-teal-400 border-t-transparent rounded-full animate-spin" />
                            ) : (
                                <ComboboxButton className="flex items-center">
                                    <span className="sr-only">Search users</span>
                                </ComboboxButton>
                            )}
                        </div>
                    </div>

                    {/* Helper Text */}
                    {isFocused && query.length > 0 && query.length < 3 && (
                        <p className="mt-1.5 text-xs text-slate-500 dark:text-slate-400">
                            Type {3 - query.length} more character{3 - query.length !== 1 ? 's' : ''} to search
                        </p>
                    )}

                    {/* Dropdown Options */}
                    {showDropdown && (
                        <ComboboxOptions
                            static
                            className="absolute mt-2 max-h-72 w-full overflow-auto rounded-lg bg-white dark:bg-slate-800 py-2 shadow-lg ring-1 ring-slate-200 dark:ring-slate-700 focus:outline-none z-50"
                        >
                            {/* Loading State */}
                            {users.length === 0 && loading && (
                                <div className="flex items-center gap-3 px-4 py-3 text-slate-500 dark:text-slate-400">
                                    <div className="h-4 w-4 border-2 border-slate-300 dark:border-slate-600 border-t-teal-500 dark:border-t-teal-400 rounded-full animate-spin" />
                                    <span className="text-sm">Searching users...</span>
                                </div>
                            )}

                            {/* Empty State */}
                            {users.length === 0 && !loading && query.length >= 3 && (
                                <div className="px-4 py-6 text-center">
                                    <div className="mx-auto h-10 w-10 rounded-full bg-slate-100 dark:bg-slate-700 flex items-center justify-center mb-3">
                                        <HugeiconsIcon icon={UserIcon} size={20} className="text-slate-400 dark:text-slate-500" />
                                    </div>
                                    <p className="text-sm font-medium text-slate-900 dark:text-slate-100">No users found</p>
                                    <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                                        Try a different search or paste an npub directly
                                    </p>
                                </div>
                            )}

                            {/* Results */}
                            {users.length > 0 && (
                                <div className="divide-y divide-slate-100 dark:divide-slate-700/50">
                                    {users.map((user) => (
                                        <ComboboxOption
                                            key={user.pubkey}
                                            value={user}
                                            className="relative cursor-pointer select-none px-4 py-3 text-slate-900 dark:text-slate-100 data-[focus]:bg-slate-50 dark:data-[focus]:bg-slate-700/50 transition-colors"
                                        >
                                            {({ focus, selected }) => (
                                                <div className="flex items-center gap-3">
                                                    {/* Avatar */}
                                                    <div className="h-10 w-10 rounded-full bg-slate-100 dark:bg-slate-700 overflow-hidden flex-shrink-0 ring-2 ring-slate-200 dark:ring-slate-600">
                                                        {(user.profile?.image || user.profile?.picture) ? (
                                                            <img
                                                                src={user.profile.image ?? user.profile.picture}
                                                                alt=""
                                                                className="h-full w-full object-cover"
                                                                onError={(e) => {
                                                                    const target = e.target as HTMLImageElement
                                                                    target.style.display = 'none'
                                                                    target.parentElement!.innerHTML = `<div class="h-full w-full flex items-center justify-center"><svg class="h-5 w-5 text-slate-400" fill="currentColor" viewBox="0 0 24 24"><path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/></svg></div>`
                                                                }}
                                                            />
                                                        ) : (
                                                            <div className="h-full w-full flex items-center justify-center">
                                                                <HugeiconsIcon icon={UserIcon} size={20} className="text-slate-400 dark:text-slate-500" />
                                                            </div>
                                                        )}
                                                    </div>

                                                    {/* User Info */}
                                                    <div className="flex-1 min-w-0">
                                                        <p className={classNames(
                                                            "text-sm truncate",
                                                            selected ? "font-semibold" : "font-medium"
                                                        )}>
                                                            {user.profile?.name || user.profile?.display_name || 'Anonymous'}
                                                        </p>
                                                        <p className={classNames(
                                                            "text-xs truncate mt-0.5",
                                                            focus ? "text-slate-600 dark:text-slate-300" : "text-slate-500 dark:text-slate-400"
                                                        )}>
                                                            {user.profile?.nip05 || truncateNpub(user.pubkey)}
                                                        </p>
                                                    </div>

                                                    {/* Selected Indicator */}
                                                    {selected && (
                                                        <div className="flex-shrink-0">
                                                            <HugeiconsIcon
                                                                icon={Tick02Icon}
                                                                size={18}
                                                                className="text-teal-600 dark:text-teal-400"
                                                            />
                                                        </div>
                                                    )}
                                                </div>
                                            )}
                                        </ComboboxOption>
                                    ))}
                                </div>
                            )}
                        </ComboboxOptions>
                    )}
                </div>
            </Combobox>
        </div>
    )
}
