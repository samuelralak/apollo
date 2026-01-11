import type { NDKEvent } from "@nostr-dev-kit/ndk";
import type { BookmarkList, BookmarkRef } from "../types/bookmark.types";
import constants from "../../../constants";

/**
 * Transform a kind 10003 event to BookmarkList domain model
 */
export const bookmarkListTransformer = (event: NDKEvent): BookmarkList => {
    const bookmarkedCoordinates: string[] = [];

    // Extract "a" tags for addressable events (questions are kind 30050)
    for (const tag of event.tags) {
        if (tag[0] === 'a' && tag[1]) {
            // Validate it's a question coordinate (starts with questionKind:)
            if (tag[1].startsWith(`${constants.questionKind}:`)) {
                bookmarkedCoordinates.push(tag[1]);
            }
        }
    }

    return {
        eventId: event.id,
        pubkey: event.pubkey,
        createdAt: event.created_at ?? Math.floor(Date.now() / 1000),
        bookmarkedCoordinates
    };
};

/**
 * Parse a coordinate string into its components
 */
export const parseBookmarkCoordinate = (coordinate: string): BookmarkRef | null => {
    const parts = coordinate.split(':');
    if (parts.length < 3) return null;

    const kind = parseInt(parts[0], 10);
    if (isNaN(kind)) return null;

    return {
        coordinate,
        kind,
        questionPubkey: parts[1],
        questionId: parts[2]
    };
};

/**
 * Build a coordinate string from components
 */
export const buildQuestionCoordinate = (
    pubkey: string,
    identifier: string,
    kind: number = constants.questionKind
): string => {
    return `${kind}:${pubkey}:${identifier}`;
};

/**
 * Build the tags array for a new kind 10003 event
 */
export const buildBookmarkTags = (coordinates: string[]): string[][] => {
    const tags: string[][] = [];

    // Add "d" tag (required for replaceable events, empty string is fine)
    tags.push(['d', '']);

    // Add "a" tag for each bookmark
    for (const coord of coordinates) {
        tags.push(['a', coord]);
    }

    return tags;
};
