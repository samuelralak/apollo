import { useMemo } from "react";
import { useSelector } from "react-redux";
import type { RootState } from "../../../app/store";

interface UseNotificationBadgeReturn {
    /** Count of unread notifications (respects category settings) */
    unreadCount: number;
    /** Whether to show the notification UI */
    showNotifications: boolean;
}

/**
 * Lightweight hook for notification badge display
 *
 * Use this when you only need the unread count without the full
 * notification list or subscription setup. Optimized for nav components.
 *
 * For full notification functionality, use useNotifications instead.
 */
const useNotificationBadge = (): UseNotificationBadgeReturn => {
    const isLoggedIn = useSelector((state: RootState) => state.auth.isLoggedIn);
    const { ids, lastReadTimestamp, settings, byId } = useSelector(
        (state: RootState) => state.notification
    );

    const showNotifications = isLoggedIn && settings.showInApp;

    // Calculate unread count with early-exit optimization
    // Since notifications are sorted newest-first, we can stop when we hit an old one
    const unreadCount = useMemo(() => {
        if (!showNotifications) return 0;

        let count = 0;
        for (const id of ids) {
            const n = byId[id];
            if (!n) continue;

            if (n.createdAt > lastReadTimestamp && settings.enabled[n.category]) {
                count++;
            } else if (n.createdAt <= lastReadTimestamp) {
                // All subsequent notifications are older (read), stop counting
                break;
            }
            // If createdAt > lastReadTimestamp but category disabled, continue to next
        }
        return count;
    }, [showNotifications, ids, byId, lastReadTimestamp, settings.enabled]);

    return { unreadCount, showNotifications };
};

export default useNotificationBadge;
