import {useMemo} from "react";
import {useAsyncAbortable, useMountEffect, useUpdateEffect} from "@react-hookz/web";
import {queryProfile} from "nostr-tools/nip05";

/**
 * NIP-05 verification cache with TTL
 *
 * Cache structure: { [nip05]: { verified: boolean, pubkey: string, expiresAt: number } }
 *
 * - Successful verifications cached for 1 hour
 * - Failed verifications cached for 5 minutes (retry sooner)
 * - Cache persisted to localStorage for cross-session reuse
 */

const CACHE_KEY = 'apollo:nip05-cache';
const SUCCESS_TTL_MS = 60 * 60 * 1000; // 1 hour
const FAILURE_TTL_MS = 5 * 60 * 1000;  // 5 minutes

interface CacheEntry {
    verified: boolean;
    pubkey: string;
    expiresAt: number;
}

type Nip05Cache = Record<string, CacheEntry>;

// In-memory cache (hydrated from localStorage on first access)
let memoryCache: Nip05Cache | null = null;
let cacheSize = 0;

const getCache = (): Nip05Cache => {
    if (memoryCache !== null) {
        return memoryCache;
    }

    try {
        const stored = localStorage.getItem(CACHE_KEY);
        const parsed = stored ? JSON.parse(stored) as Nip05Cache : {};

        // Clean up expired entries on initial load - single pass O(n)
        const now = Date.now();
        let hasExpired = false;
        let count = 0;

        for (const key in parsed) {
            if (parsed[key].expiresAt < now) {
                delete parsed[key];
                hasExpired = true;
            } else {
                count++;
            }
        }

        memoryCache = parsed;
        cacheSize = count;

        // Persist cleaned cache if we removed expired entries
        if (hasExpired) {
            try {
                localStorage.setItem(CACHE_KEY, JSON.stringify(memoryCache));
            } catch {
                // Ignore write errors
            }
        }
    } catch {
        memoryCache = {};
        cacheSize = 0;
    }

    return memoryCache;
};

const setCache = (cache: Nip05Cache): void => {
    memoryCache = cache;

    try {
        localStorage.setItem(CACHE_KEY, JSON.stringify(cache));
    } catch {
        // localStorage full or unavailable - continue with memory cache only
    }
};

const getCacheEntry = (nip05: string, pubkey: string): CacheEntry | null => {
    const cache = getCache();
    const entry = cache[nip05];

    if (!entry) return null;

    // Check if expired
    if (Date.now() > entry.expiresAt) {
        // Clean up expired entry
        delete cache[nip05];
        cacheSize--;
        setCache(cache);
        return null;
    }

    // Check if pubkey matches (same nip05 could be claimed by different pubkeys)
    if (entry.pubkey !== pubkey) {
        return null;
    }

    return entry;
};

/**
 * Quickselect to find kth smallest element - O(n) average
 */
const quickselect = (arr: number[], k: number): number => {
    if (arr.length <= k) return arr[arr.length - 1];

    const pivot = arr[Math.floor(Math.random() * arr.length)];
    const left = arr.filter(x => x < pivot);
    const equal = arr.filter(x => x === pivot);
    const right = arr.filter(x => x > pivot);

    if (k < left.length) {
        return quickselect(left, k);
    } else if (k < left.length + equal.length) {
        return pivot;
    } else {
        return quickselect(right, k - left.length - equal.length);
    }
};

const setCacheEntry = (nip05: string, pubkey: string, verified: boolean): void => {
    const cache = getCache();
    const ttl = verified ? SUCCESS_TTL_MS : FAILURE_TTL_MS;
    const isNewEntry = !(nip05 in cache);

    cache[nip05] = {
        verified,
        pubkey,
        expiresAt: Date.now() + ttl
    };

    if (isNewEntry) {
        cacheSize++;
    }

    // Prune old entries if cache gets too large - O(n) average
    if (cacheSize > 500) {
        const toRemove = cacheSize - 400;

        // Collect expiration times - O(n)
        const expirations: number[] = [];
        for (const key in cache) {
            expirations.push(cache[key].expiresAt);
        }

        // Find threshold (kth smallest) - O(n) average
        const threshold = quickselect(expirations, toRemove);

        // Delete entries at or below threshold - O(n)
        let removed = 0;
        for (const key in cache) {
            if (cache[key].expiresAt <= threshold && removed < toRemove) {
                delete cache[key];
                removed++;
            }
        }
        cacheSize -= removed;
    }

    setCache(cache);
};

/**
 * Hook to verify NIP-05 identifier with caching
 *
 * @param nip05 - NIP-05 identifier (e.g., "user@domain.com")
 * @param pubkey - Expected public key (hex)
 * @returns { isVerified, isLoading }
 */
const useNip05Verification = (nip05: string | undefined, pubkey: string | undefined): {
    isVerified: boolean;
    isLoading: boolean;
} => {
    // Check cache synchronously for immediate result
    const cachedResult = useMemo(() => {
        if (!nip05 || !pubkey) return null;
        return getCacheEntry(nip05, pubkey);
    }, [nip05, pubkey]);

    // Async verification function
    const [state, actions] = useAsyncAbortable(async (_signal, id: string, key: string) => {
        // Double-check cache (may have been populated by another component)
        const cached = getCacheEntry(id, key);
        if (cached !== null) {
            return cached.verified;
        }

        // Fetch and verify
        try {
            const profile = await queryProfile(id);
            const verified = profile?.pubkey === key;
            setCacheEntry(id, key, verified);
            return verified;
        } catch {
            setCacheEntry(id, key, false);
            return false;
        }
    });

    // Execute on mount if not cached
    useMountEffect(() => {
        if (nip05 && pubkey && cachedResult === null) {
            actions.execute(nip05, pubkey);
        }
    });

    // Re-execute when inputs change (skip first render)
    useUpdateEffect(() => {
        actions.reset();
        if (nip05 && pubkey && getCacheEntry(nip05, pubkey) === null) {
            actions.execute(nip05, pubkey);
        }
    }, [nip05, pubkey]);

    // Derive final state
    const isLoading = state.status === 'loading';
    const isVerified = cachedResult?.verified ?? state.result ?? false;

    return {isVerified, isLoading};
};

export default useNip05Verification;
