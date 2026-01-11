import { useCallback, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import type { NDKEvent, NDKFilter } from "@nostr-dev-kit/ndk";
import { AppDispatch, RootState } from "../../../app/store";
import useNDKSubscription, { EventHandlingMode, ResourceType } from "../../../shared/hooks/useNDKSubscription";
import constants from "../../../constants";
import {
    addNotification,
    markAllRead,
    markReadUntil,
    setInitialized
} from "../store/notification.slice";
import { notificationTransformer } from "../services/notification.transformer";
import type { Notification } from "../types/notification.types";
import { NotificationCategory } from "../types/notification.types";

interface UseNotificationsReturn {
    /** All notifications (sorted newest first) */
    notifications: Notification[];
    /** Unread notifications */
    unreadNotifications: Notification[];
    /** Count of unread notifications */
    unreadCount: number;
    /** Whether there are any unread notifications */
    hasUnread: boolean;
    /** Timestamp of last read - use for efficient isUnread checks */
    lastReadTimestamp: number;
    /** Loading state */
    loading: boolean;
    /** Whether initial load is complete */
    initialized: boolean;
    /** Mark all notifications as read */
    markAllAsRead: () => void;
    /** Mark notifications read up to a specific timestamp */
    markReadUpTo: (timestamp: number) => void;
    /** Mark a specific notification as read (marks all up to its timestamp) */
    markAsRead: (notification: Notification) => void;
    /** Get notifications by category */
    getByCategory: (category: NotificationCategory) => Notification[];
    /** Error message if any */
    error: string | null;
}

/**
 * Hook for managing user notifications
 *
 * Features:
 * - Subscribes to events where user is tagged via #p
 * - Real-time notification updates (IMMEDIATE mode)
 * - Filters by enabled notification categories
 * - Read/unread tracking via localStorage
 */
const useNotifications = (): UseNotificationsReturn => {
    const dispatch = useDispatch<AppDispatch>();

    // Auth state
    const auth = useSelector((state: RootState) => state.auth);
    const isLoggedIn = auth.isLoggedIn;
    const userPubkey = auth.pubkey;

    // Notification state
    const notificationState = useSelector((state: RootState) => state.notification);
    const { byId, ids, lastReadTimestamp, loading, initialized, settings, error } = notificationState;

    // Build notifications array from state
    const notifications = useMemo(() => {
        return ids
            .map(id => byId[id])
            .filter((n): n is Notification => n !== undefined);
    }, [ids, byId]);

    // Filter by enabled categories
    const filteredNotifications = useMemo(() => {
        return notifications.filter(n => settings.enabled[n.category]);
    }, [notifications, settings.enabled]);

    // Calculate unread notifications
    const unreadNotifications = useMemo(() => {
        return filteredNotifications.filter(n => n.createdAt > lastReadTimestamp);
    }, [filteredNotifications, lastReadTimestamp]);

    // Subscription filter - events where user is tagged
    const filters = useMemo<NDKFilter | null>(() => {
        if (!isLoggedIn || !userPubkey) return null;
        return {
            kinds: [
                constants.answerKind as number,
                constants.voteKind as number,
                constants.noteKind as number,
                constants.zapReceiptKind as number,
                constants.contactListKind as number
            ],
            "#p": [userPubkey],
            limit: 100
        };
    }, [isLoggedIn, userPubkey]);

    // Handle incoming notification events
    const handleNotificationEvent = useCallback((event: NDKEvent) => {
        if (!userPubkey) return;

        const notification = notificationTransformer(event, userPubkey);
        if (notification) {
            dispatch(addNotification(notification));
        }
    }, [userPubkey, dispatch]);

    // Handle end of stored events
    const handleEose = useCallback(() => {
        dispatch(setInitialized());
    }, [dispatch]);

    // Subscribe to notification events
    useNDKSubscription(
        filters ?? { kinds: [] },
        handleNotificationEvent,
        handleEose,
        {
            ndkOptions: { closeOnEose: false },
            mode: EventHandlingMode.IMMEDIATE,
            resourceType: ResourceType.NOTIFICATION,
            enabled: !!filters
        }
    );

    // Mark all as read
    const markAllAsRead = useCallback(() => {
        dispatch(markAllRead());
    }, [dispatch]);

    // Mark read up to timestamp
    const markReadUpTo = useCallback((timestamp: number) => {
        dispatch(markReadUntil(timestamp));
    }, [dispatch]);

    // Mark a specific notification (and all older) as read
    // The reducer handles the check for whether the timestamp is newer
    const markAsRead = useCallback((notification: Notification) => {
        dispatch(markReadUntil(notification.createdAt));
    }, [dispatch]);

    // Get notifications by category
    const getByCategory = useCallback((category: NotificationCategory): Notification[] => {
        return filteredNotifications.filter(n => n.category === category);
    }, [filteredNotifications]);

    return {
        notifications: filteredNotifications,
        unreadNotifications,
        unreadCount: unreadNotifications.length,
        hasUnread: unreadNotifications.length > 0,
        lastReadTimestamp,
        loading,
        initialized,
        markAllAsRead,
        markReadUpTo,
        markAsRead,
        getByCategory,
        error
    };
};

export default useNotifications;
