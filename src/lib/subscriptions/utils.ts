import type { NDKFilter } from "@nostr-dev-kit/ndk";

/**
 * Normalize a filter by sorting keys and array values for consistent hashing.
 * This ensures that { kinds: [2,1], "#a": ["b","a"] } and { "#a": ["a","b"], kinds: [1,2] }
 * produce the same hash.
 */
export function normalizeFilter(filter: NDKFilter): NDKFilter {
    const normalized: NDKFilter = {};

    // Sort keys alphabetically
    const sortedKeys = Object.keys(filter).sort();

    for (const key of sortedKeys) {
        // Use Record type for dynamic key access to properly handle tag filters like #p
        const value = (filter as Record<string, unknown>)[key];

        if (Array.isArray(value)) {
            // Sort array values for consistent comparison
            (normalized as Record<string, unknown>)[key] = [...value].sort();
        } else if (value !== undefined) {
            (normalized as Record<string, unknown>)[key] = value;
        }
    }

    return normalized;
}

/**
 * Create a hash string from normalized filter(s).
 * Used for deduplication - identical filters produce identical hashes.
 */
export function hashFilter(filters: NDKFilter | NDKFilter[]): string {
    const filterArray = Array.isArray(filters) ? filters : [filters];
    const normalized = filterArray.map(normalizeFilter);
    return JSON.stringify(normalized);
}

/**
 * Check if two filters match (after normalization).
 */
export function filtersMatch(a: NDKFilter, b: NDKFilter): boolean {
    return hashFilter(a) === hashFilter(b);
}

/**
 * Generate a unique subscription ID.
 * Format: prefix_timestamp_randomString
 */
export function generateSubscriptionId(prefix: string = 'sub'): string {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 11);
    return `${prefix}_${timestamp}_${random}`;
}

/**
 * Check if a context matches another context.
 * Used for filtering buffered events.
 */
export function contextMatches(
    a?: { parentId?: string; parentPubkey?: string },
    b?: { parentId?: string; parentPubkey?: string }
): boolean {
    if (!a && !b) return true;
    if (!a || !b) return false;
    return a.parentId === b.parentId && a.parentPubkey === b.parentPubkey;
}
