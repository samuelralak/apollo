import type { NDKEvent } from "@nostr-dev-kit/ndk";
import type { FollowList, FollowRef } from "../types/follow.types";

/**
 * Validates a pubkey is a valid 64-character hex string
 */
export const isValidPubkey = (pubkey: string): boolean => {
    return /^[0-9a-f]{64}$/i.test(pubkey);
};

/**
 * Transform a kind 3 event into a FollowList
 *
 * NIP-02 p tag format: ["p", <pubkey>, <relay_url?>, <petname?>]
 */
export const followListTransformer = (event: NDKEvent): FollowList => {
    // Use Set for O(1) deduplication instead of O(n) includes()
    const seenPubkeys = new Set<string>();
    const followedPubkeys: string[] = [];

    for (const tag of event.tags) {
        // Only process "p" tags (follow entries)
        if (tag[0] === 'p' && tag[1]) {
            const pubkey = tag[1];
            // Validate pubkey format and avoid duplicates (O(1) lookup)
            if (isValidPubkey(pubkey) && !seenPubkeys.has(pubkey)) {
                seenPubkeys.add(pubkey);
                followedPubkeys.push(pubkey);
            }
        }
    }

    return {
        eventId: event.id,
        pubkey: event.pubkey,
        createdAt: event.created_at ?? Math.floor(Date.now() / 1000),
        followedPubkeys
    };
};

/**
 * Extract full follow references including relay hints
 * Useful for displaying relay info or petnames
 */
export const extractFollowRefs = (event: NDKEvent): FollowRef[] => {
    const refs: FollowRef[] = [];

    for (const tag of event.tags) {
        if (tag[0] === 'p' && tag[1] && isValidPubkey(tag[1])) {
            refs.push({
                pubkey: tag[1],
                relayUrl: tag[2] || undefined,
                petname: tag[3] || undefined
            });
        }
    }

    return refs;
};

/**
 * Build tags array for publishing a follow list event
 *
 * @param pubkeys - Array of pubkeys to follow
 * @returns Tags array for NDK publishEvent
 */
export const buildFollowTags = (pubkeys: string[]): string[][] => {
    const tags: string[][] = [];

    // Add "p" tag for each followed pubkey
    for (const pubkey of pubkeys) {
        if (isValidPubkey(pubkey)) {
            tags.push(['p', pubkey]);
        }
    }

    return tags;
};

/**
 * Build tags with relay hints (optional enhancement)
 *
 * @param refs - Array of follow references with optional relay hints
 * @returns Tags array for NDK publishEvent
 */
export const buildFollowTagsWithRelays = (refs: FollowRef[]): string[][] => {
    const tags: string[][] = [];

    for (const ref of refs) {
        if (isValidPubkey(ref.pubkey)) {
            const tag = ['p', ref.pubkey];
            if (ref.relayUrl) {
                tag.push(ref.relayUrl);
                if (ref.petname) {
                    tag.push(ref.petname);
                }
            }
            tags.push(tag);
        }
    }

    return tags;
};
