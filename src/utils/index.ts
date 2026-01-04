import dayjs from "dayjs";
import {NDKTag} from "@nostr-dev-kit/ndk";
import {nip19} from "nostr-tools";

/**
 *
 * @param classes
 */
export const classNames = (...classes: string[]): string => {
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
