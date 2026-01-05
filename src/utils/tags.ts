/**
 * Safe tag accessor utilities for Nostr event tags.
 * Prevents runtime crashes from malformed or missing tags.
 */

/**
 * Parsed coordinate from an "a" tag (kind:pubkey:identifier)
 */
export interface Coordinate {
    kind: number;
    pubkey: string;
    identifier: string;
}

/**
 * Safely get a single value from a tag array.
 * Returns undefined if the tag doesn't exist or index is out of bounds.
 *
 * @param tags - Record of tag key to array of values (from tagFromEvents)
 * @param key - The tag key (e.g., 'd', 'a', 'e')
 * @param index - The index within the tag's value array (default: 0)
 */
export function safeGetTag(
    tags: Record<string, string[]>,
    key: string,
    index: number = 0
): string | undefined {
    const values = tags[key];
    if (!values || !Array.isArray(values) || values.length <= index) {
        return undefined;
    }
    return values[index];
}

/**
 * Safely get the last value from a tag array.
 * Useful for getting the last 'e' tag (reference event).
 *
 * @param tags - Record of tag key to array of values
 * @param key - The tag key
 */
export function safeGetLastTag(
    tags: Record<string, string[]>,
    key: string
): string | undefined {
    const values = tags[key];
    if (!values || !Array.isArray(values) || values.length === 0) {
        return undefined;
    }
    return values[values.length - 1];
}

/**
 * Safely get all values for a tag key.
 * Returns empty array if tag doesn't exist.
 *
 * @param tags - Record of tag key to array of values
 * @param key - The tag key
 */
export function safeGetAllTags(
    tags: Record<string, string[]>,
    key: string
): string[] {
    const values = tags[key];
    if (!values || !Array.isArray(values)) {
        return [];
    }
    return values;
}

/**
 * Parse an "a" tag coordinate string (kind:pubkey:identifier).
 * Returns undefined if the format is invalid.
 *
 * @param coordinate - The coordinate string to parse
 */
export function parseCoordinate(coordinate: string | undefined): Coordinate | undefined {
    if (!coordinate) {
        return undefined;
    }

    const parts = coordinate.split(':');
    if (parts.length < 3) {
        return undefined;
    }

    const kind = parseInt(parts[0], 10);
    if (isNaN(kind)) {
        return undefined;
    }

    return {
        kind,
        pubkey: parts[1],
        identifier: parts[2]
    };
}

/**
 * Safely get the identifier from an "a" tag coordinate.
 * Convenience function combining safeGetTag and parseCoordinate.
 *
 * @param tags - Record of tag key to array of values
 * @param index - The index of the 'a' tag to parse (default: 0)
 */
export function safeGetCoordinateIdentifier(
    tags: Record<string, string[]>,
    index: number = 0
): string | undefined {
    const coordinate = safeGetTag(tags, 'a', index);
    return parseCoordinate(coordinate)?.identifier;
}
