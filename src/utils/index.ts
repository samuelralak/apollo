import dayjs from "dayjs";
import {NDKTag} from "@nostr-dev-kit/ndk";
import {nip19} from "nostr-tools";

/**
 * Safely extract string value from unknown type
 * Handles malformed Nostr profiles where fields may be objects instead of strings
 * @param value - value to check
 * @returns string if value is string, undefined otherwise
 */
export const safeString = (value: unknown): string | undefined => {
    if (typeof value === 'string') return value;
    return undefined;
};

/**
 * Profile-like object with optional name fields
 * Matches NDKUserProfile structure but allows unknown field types
 */
interface ProfileLike {
    display_name?: unknown;
    displayName?: unknown;
    name?: unknown;
    username?: unknown;
    [key: string]: unknown;
}

/**
 * Get display name from profile with consistent fallback chain (NIP-24 compliant)
 *
 * Order: display_name → displayName → name → username → formatNpub(pubkey)
 * - display_name: Standard field (NIP-24)
 * - displayName: Deprecated (use display_name)
 * - name: Standard username field
 * - username: Deprecated (use name)
 *
 * @param profile - User profile object (can be null/undefined)
 * @param pubkey - Hex public key for fallback
 * @returns Display name string
 */
export const getDisplayName = (profile: ProfileLike | null | undefined, pubkey: string | undefined): string => {
    return safeString(profile?.display_name)
        ?? safeString(profile?.displayName)
        ?? safeString(profile?.name)
        ?? safeString(profile?.username)
        ?? formatNpub(pubkey);
};

/**
 * Format npub for display: npub1 + first 8 characters
 * @param pubkey - hex public key (required - if missing, indicates corrupted state)
 * @returns truncated npub string (e.g., "npub1abc12345")
 */
export const formatNpub = (pubkey: string | undefined): string => {
    if (!pubkey) {
        console.error('[formatNpub] Missing pubkey - app state may be corrupted');
        return 'npub1...';
    }

    try {
        const npub = nip19.npubEncode(pubkey);
        return npub.substring(0, 13); // "npub1" (5 chars) + 8 chars = 13
    } catch {
        return pubkey.substring(0, 12) + '...';
    }
};

/**
 *
 * @param classes
 */
export const classNames = (...classes: (string | undefined)[]): string => {
    return classes.filter(Boolean).join(' ')
}

/**
 *
 * @param tags
 */
export const tagFromEvents = (tags: NDKTag[]): Record<string, string[]> => {
    return tags.reduce((acc, curr) => {
        const [key, ...rest] = curr
        return {...acc, [key]: [...(acc[key] ?? []), ...rest]}
    }, {} as Record<string, string[]>)
}

/**
 *
 * @param markdown
 */
export const markdownToText = (markdown: string): string => {
    // Truncate at the first occurrence of a code block
    const codeBlockIndex = markdown.indexOf('```');

    if (codeBlockIndex !== -1) {
        markdown = markdown.substring(0, codeBlockIndex);
    }

    // Regular expression patterns for removing markdown syntax
    const patterns: [RegExp, string][] = [
        [/\*\*(.*?)\*\*/g, '$1'],  // Bold
        [/__(.*?)__/g, '$1'],      // Bold
        [/\*(.*?)\*/g, '$1'],      // Italic
        [/_(.*?)_/g, '$1'],        // Italic
        [/\[(.*?)\]\(.*?\)/g, '$1'], // Links
        [/!\[(.*?)\]\(.*?\)/g, '$1'], // Images
        [/#\s?(.*)/g, '$1'],       // Headers
        [/>\s?(.*)/g, '$1'],       // Blockquotes
        [/`{1,2}(.*?)`{1,2}/g, '$1'], // Inline code
        [/\n{2,}/g, '\n'],         // Multiple newlines
        [/^\s+|\s+$/g, '']         // Trim
    ];

    // Apply each pattern to remove markdown syntax
    patterns.forEach(([pattern, replacement]) => {
        markdown = markdown.replace(pattern, replacement);
    });

    return markdown;
}

/**
 *
 * @param key
 */
export const validatePrivateKey = (key: string): boolean => {
    const nsecRegex = /^nsec\d+[a-zA-Z0-9]+$/;
    return nsecRegex.test(key)
}

/**
 *
 * @param unixTimestamp
 */
export const formatDateTime = (unixTimestamp: number | undefined): string => {
    if (unixTimestamp) {
        const now = dayjs();
        const timestampDate = dayjs.unix(unixTimestamp);

        const diffInSeconds = now.diff(timestampDate, 'second');
        const diffInMinutes = now.diff(timestampDate, 'minute');
        const diffInHours = now.diff(timestampDate, 'hour');
        const diffInDays = now.diff(timestampDate, 'day');
        const diffInMonths = now.diff(timestampDate, 'month');
        const diffInYears = now.diff(timestampDate, 'year');

        if (diffInSeconds < 60) return `${diffInSeconds} seconds ago`;
        if (diffInMinutes < 60) return `${diffInMinutes} minutes ago`;
        if (diffInHours < 24) return `${diffInHours} hours ago`;
        if (diffInDays < 3) return `${diffInDays} days ago`;
        if (diffInMonths < 11) return timestampDate.format("D MMM");
        if (diffInMonths >= 11 || diffInYears >= 1)
            return `${diffInYears} years ago`;
    }

    return ""
};

/**
 *
 * @param nsec
 */
export const decodeNsec = (nsec: `nsec1${string}`): Uint8Array => {
    const {data} = nip19.decode(nsec)
    return data
}


/**
 *
 * @param text
 * @param callback
 */
export const copyToClipboard = async (text: string, callback?: () => void) => {
    if (window.navigator && window.isSecureContext) {
        await window.navigator.clipboard.writeText(text)
        if (callback) {
            callback()
        }
    }
}
