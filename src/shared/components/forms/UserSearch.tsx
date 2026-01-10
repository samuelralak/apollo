import { useContext, useState, useEffect } from 'react'
import { Combobox, ComboboxInput, ComboboxButton, ComboboxOptions, ComboboxOption } from '@headlessui/react'
import { CheckIcon, ChevronUpDownIcon } from '@heroicons/react/20/solid'
import { NDKContext } from "../../../lib/ndk/NDKProvider"
import { NDKUser, NDKRelaySet } from "@nostr-dev-kit/ndk"
import AvatarPlaceholder from "../AvatarPlaceholder"
import constants from "../../../constants"

interface UserSearchProps {
    onSelect: (user: NDKUser) => void
    excludePubkeys?: string[]
}

export default function UserSearch({ onSelect, excludePubkeys = [] }: UserSearchProps) {
    const { ndkInstance } = useContext(NDKContext) as NDKContext
    const [query, setQuery] = useState('')
    const [users, setUsers] = useState<NDKUser[]>([])
    const [loading, setLoading] = useState(false)

    useEffect(() => {
        let cancelled = false

        const performSearch = async (searchQuery: string) => {
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
                        if (!cancelled) {
                            setUsers([user])
                            setLoading(false)
                        }
                        return
                    } catch {
                        // Invalid encoding, fall through to text search
                    }
                }

                // 2. Text Search (NIP-50) via dedicated search relays
                // Search relays are configured in constants.searchRelays
                // See architecture/search-relays.md for details
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

                if (cancelled) return

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
                if (!cancelled) {
                    console.error("Search failed:", error)
                    setUsers([])
                }
            } finally {
                if (!cancelled) {
                    setLoading(false)
                }
            }
        }

        const timeoutId = setTimeout(() => {
            performSearch(query)
        }, 400) // 400ms debounce for snappier feel

        return () => {
            cancelled = true
            clearTimeout(timeoutId)
        }
    }, [query, ndkInstance, excludePubkeys])

    const handleSelect = (user: NDKUser | null) => {
        if (!user) return
        onSelect(user)
        setQuery('') // Clear input only on successful selection
    }

    return (
        <div className="w-full relative z-20">
            <Combobox value={null} onChange={handleSelect}>
                <div className="relative mt-1">
                    <div className="relative w-full cursor-default overflow-hidden rounded-lg bg-white dark:bg-slate-800 text-left shadow-sm ring-1 ring-inset ring-slate-200 dark:ring-slate-700 focus-within:ring-2 focus-within:ring-teal-600 dark:focus-within:ring-teal-500 sm:text-sm sm:leading-6">
                        <ComboboxInput
                            className="w-full border-none py-2 pl-3 pr-10 bg-transparent text-slate-900 dark:text-slate-100 focus:ring-0 focus:outline-none placeholder:text-slate-400"
                            value={query}
                            onChange={(event) => setQuery(event.target.value)}
                            placeholder="Search user or paste npub..."
                        />
                        {/* Loading Indicator */}
                        <div className="absolute inset-y-0 right-8 flex items-center">
                            {loading && (
                                <div className="h-4 w-4 border-2 border-teal-500 dark:border-teal-400 border-t-transparent rounded-full animate-spin" />
                            )}
                        </div>
                        <ComboboxButton className="absolute inset-y-0 right-0 flex items-center pr-2">
                            <ChevronUpDownIcon
                                className="h-5 w-5 text-slate-400 dark:text-slate-500"
                                aria-hidden="true"
                            />
                        </ComboboxButton>
                    </div>

                    {/* Render Options only if we have query or results */}
                    {(users.length > 0 || query.length >= 3) && (
                        <ComboboxOptions
                            static
                            className="absolute mt-1 max-h-60 w-full overflow-auto rounded-md bg-white dark:bg-slate-800 py-1 text-base shadow-lg ring-1 ring-black/5 dark:ring-white/10 focus:outline-none sm:text-sm z-50"
                        >
                            {users.length === 0 && !loading && query.length >= 3 ? (
                                <div className="relative cursor-default select-none px-4 py-2 text-slate-500 dark:text-slate-400">
                                    No users found. Try pasting an npub.
                                </div>
                            ) : users.length === 0 && loading ? (
                                <div className="relative cursor-default select-none px-4 py-2 text-slate-500 dark:text-slate-400">
                                    Searching...
                                </div>
                            ) : (
                                users.map((user) => (
                                    <ComboboxOption
                                        key={user.pubkey}
                                        value={user}
                                        className="relative cursor-default select-none py-2 pl-3 pr-9 text-slate-900 dark:text-slate-100 data-[focus]:bg-teal-600 data-[focus]:text-white dark:data-[focus]:bg-teal-500"
                                    >
                                        {({ focus, selected }) => (
                                            <div className="flex items-center gap-3">
                                                {/* Safe Image Handling */}
                                                <div className="h-8 w-8 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden flex-shrink-0">
                                                    {user.profile?.image ? (
                                                        <img
                                                            src={user.profile.image}
                                                            alt=""
                                                            className="h-full w-full object-cover"
                                                            onError={(e) => {
                                                                (e.target as HTMLImageElement).style.display = 'none'
                                                            }}
                                                        />
                                                    ) : (
                                                        <AvatarPlaceholder mini />
                                                    )}
                                                </div>
                                                <div className="flex flex-col min-w-0">
                                                    <span className={`truncate ${selected ? 'font-semibold' : ''}`}>
                                                        {user.profile?.name || user.profile?.display_name || 'Anonymous'}
                                                    </span>
                                                    {user.profile?.nip05 && (
                                                        <span className={`text-xs truncate ${focus ? 'text-teal-200' : 'text-slate-500 dark:text-slate-400'}`}>
                                                            {user.profile.nip05}
                                                        </span>
                                                    )}
                                                </div>
                                                {selected && (
                                                    <span className={`absolute inset-y-0 right-0 flex items-center pr-3 ${focus ? 'text-white' : 'text-teal-600 dark:text-teal-400'}`}>
                                                        <CheckIcon className="h-5 w-5" aria-hidden="true" />
                                                    </span>
                                                )}
                                            </div>
                                        )}
                                    </ComboboxOption>
                                ))
                            )}
                        </ComboboxOptions>
                    )}
                </div>
            </Combobox>
        </div>
    )
}
