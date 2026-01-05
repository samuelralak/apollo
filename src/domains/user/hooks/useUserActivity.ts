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
    const [events, setEvents] = useState<NDKEvent[]>([]);
    const [loading, setLoading] = useState(true);

    // Reset state when pubkey changes (useUpdateEffect skips initial mount)
    useUpdateEffect(() => {
        setEvents([]);
        setLoading(true);
    }, [pubkey]);

    // Calculate timestamp for 365 days ago
    const since = useMemo(() =>
        Math.floor(Date.now() / 1000) - (365 * 24 * 60 * 60),
    []);

    // Memoize filters to prevent unnecessary re-subscriptions
    const activityFilters = useMemo<NDKFilter>(() => ({
        kinds: [
            constants.questionKind,
            constants.answerKind,
            constants.voteKind,
            constants.noteKind
        ],
        authors: [pubkey],
        since
    }), [pubkey, since]);

    // Handle incoming activity events
    const handleEvent = useCallback((event: NDKEvent) => {
        setEvents(prev => {
            if (prev.some(e => e.id === event.id)) return prev;
            return [...prev, event];
        });
    }, []);

    const handleEose = useCallback(() => setLoading(false), []);

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
            totalContributions: events.length
        };
    }, [events]);

    return {activity, loading};
};

export default useUserActivity;
