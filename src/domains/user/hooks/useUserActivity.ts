import {useState, useCallback, useMemo} from "react";
import {useUpdateEffect} from "@react-hookz/web";
import type {NDKEvent, NDKFilter} from "@nostr-dev-kit/ndk";
import useNDKSubscription, {ResourceType} from "../../../shared/hooks/useNDKSubscription";
import constants from "../../../constants";
import type {ActivityDay, UserActivity} from "../types/profile.types";

interface UseUserActivityResult {
    activity: UserActivity;
    loading: boolean;
}

// Stable empty return for stale state (prevents new object creation every render)
const EMPTY_ACTIVITY: UserActivity = { days: [], totalContributions: 0 };

/**
 * Converts event count to intensity level (0-4) for heatmap coloring.
 */
const getIntensityLevel = (count: number): 0 | 1 | 2 | 3 | 4 => {
    if (count === 0) return 0;
    if (count <= 2) return 1;
    if (count <= 5) return 2;
    if (count <= 9) return 3;
    return 4;
};

/**
 * Hook for fetching user activity data for the contribution heatmap.
 * Subscribes to all user activity (questions, answers, votes, comments) from the last year.
 */
const useUserActivity = (pubkey: string): UseUserActivityResult => {
    // Track which pubkey the current state belongs to (prevents showing stale data)
    const [stateForPubkey, setStateForPubkey] = useState<string | undefined>(undefined);

    // Use Map for O(1) deduplication instead of array with O(n) .some() check
    const [eventsMap, setEventsMap] = useState<Map<string, NDKEvent>>(() => new Map());
    const [loading, setLoading] = useState(true);

    // Data is stale if it belongs to a different pubkey (prevents flash of old data)
    const isStale = stateForPubkey !== pubkey;

    // Reset state when pubkey changes (useUpdateEffect skips initial mount)
    useUpdateEffect(() => {
        setStateForPubkey(undefined);
        setEventsMap(new Map());
        setLoading(true);
    }, [pubkey]);

    // Calculate timestamp for 365 days ago (lazy init to avoid impure Date.now during render)
    const [since] = useState(() =>
        Math.floor(Date.now() / 1000) - (365 * 24 * 60 * 60)
    );

    // Memoize filters to prevent unnecessary re-subscriptions
    // Limit prevents relay overload from power users/bots with excessive activity
    const activityFilters = useMemo<NDKFilter>(() => ({
        kinds: [
            constants.questionKind,
            constants.answerKind,
            constants.voteKind,
            constants.noteKind
        ],
        authors: [pubkey],
        since,
        limit: 5000
    }), [pubkey, since]);

    // Handle incoming activity events - O(1) deduplication via Map
    // IMPORTANT: Use event.pubkey to prevent race condition where late events
    // from old subscription arrive after callback is updated but before cleanup.
    const handleEvent = useCallback((event: NDKEvent) => {
        // event.pubkey is the author (the user whose activity we're fetching)
        setStateForPubkey(event.pubkey);
        setEventsMap(prev => {
            if (prev.has(event.id)) return prev;
            const newMap = new Map(prev);
            newMap.set(event.id, event);
            return newMap;
        });
    }, []);

    // For EOSE, only set stateForPubkey if it hasn't been set by events yet
    const handleEose = useCallback(() => {
        setStateForPubkey(prev => prev ?? pubkey);
        setLoading(false);
    }, [pubkey]);

    // Subscribe to all user activity
    useNDKSubscription(
        activityFilters,
        handleEvent,
        handleEose,
        {
            resourceType: ResourceType.QUESTION,
            context: {parentId: `activity-${pubkey}`}
        }
    );

    // Group events by date and calculate intensity levels
    const activity = useMemo<UserActivity>(() => {
        const dayMap = new Map<string, number>();
        const events = Array.from(eventsMap.values());

        events.forEach(event => {
            if (!event.created_at) return;
            const date = new Date(event.created_at * 1000)
                .toISOString()
                .split('T')[0];
            dayMap.set(date, (dayMap.get(date) || 0) + 1);
        });

        // Convert to ActivityDay array sorted by date
        const days: ActivityDay[] = Array.from(dayMap.entries())
            .map(([date, count]) => ({
                date,
                count,
                level: getIntensityLevel(count)
            }))
            .sort((a, b) => a.date.localeCompare(b.date));

        return {
            days,
            totalContributions: eventsMap.size
        };
    }, [eventsMap]);

    // If data is stale (from previous profile), return stable empty object
    // This prevents flash of old data when navigating between profiles
    if (isStale) {
        return { activity: EMPTY_ACTIVITY, loading: true };
    }

    return {activity, loading};
};

export default useUserActivity;
