import { useCallback, useMemo, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import type { NDKEvent, NDKFilter } from "@nostr-dev-kit/ndk";
import { useUnmountEffect } from "@react-hookz/web";
import { AppDispatch, RootState } from "../../../app/store";
import useNDKSubscription, { EventHandlingMode, ResourceType } from "../../../shared/hooks/useNDKSubscription";
import constants from "../../../constants";
import {
    addNotification,
    addNotifications,
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
    /** Whether to show notification UI (logged in + showInApp setting) */
    showNotifications: boolean;
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
 * - Real-time notification updates (IMMEDIATE mode with local buffering)
 * - Filters by enabled notification categories
 * - Read/unread tracking via localStorage
 * - Optimized unread counting and batch dispatching
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

    // Buffer for batching updates during initial load
    const notificationBuffer = useRef<Notification[]>([]);
    const hasReceivedEose = useRef(false);

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

    // Calculate unread count efficiently (Early Exit)
    // Since notifications are sorted new -> old, we can stop counting once we hit an old read one.
    const unreadCount = useMemo(() => {
        let count = 0;
        for (const notification of filteredNotifications) {
            if (notification.createdAt > lastReadTimestamp) {
                count++;
            } else {
                // Found a notification <= lastReadTimestamp, so all following are also read.
                break;
            }
        }
        return count;
    }, [filteredNotifications, lastReadTimestamp]);

    const hasUnread = unreadCount > 0;
    const showNotifications = isLoggedIn && settings.showInApp;

    // Derived unread list (only computed if accessed or if count changes)
    const unreadNotifications = useMemo(() => {
        if (!hasUnread) return [];
        // We can just slice the first 'unreadCount' items because of the sort order
        return filteredNotifications.slice(0, unreadCount);
    }, [filteredNotifications, unreadCount, hasUnread]);


    // Subscription filter - events where user is tagged
    const filters = useMemo<NDKFilter | null>(() => {
        if (!isLoggedIn || !userPubkey) return null;
        return {
            kinds: [
                constants.questionKind as number, // Mentions/invites on questions
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

    // Ensure buffer is flushed on unmount
    useUnmountEffect(() => {
        if (notificationBuffer.current.length > 0) {
            dispatch(addNotifications([...notificationBuffer.current]));
        }
    });

    // Handle incoming notification events
    // Before EOSE: buffer for batch dispatch (reduces re-renders during initial load)
    // After EOSE: dispatch immediately for real-time responsiveness
    const handleNotificationEvent = useCallback((event: NDKEvent) => {
        if (!userPubkey) return;

        const notification = notificationTransformer(event, userPubkey);
        if (!notification) return;

        if (hasReceivedEose.current) {
            // Real-time: dispatch immediately
            dispatch(addNotification(notification));
        } else {
            // Initial load: buffer for batch dispatch on EOSE
            notificationBuffer.current.push(notification);
        }
    }, [userPubkey, dispatch]);

    // Handle end of stored events - flush buffer as single batch
    const handleEose = useCallback(() => {
        if (notificationBuffer.current.length > 0) {
            dispatch(addNotifications([...notificationBuffer.current]));
            notificationBuffer.current = [];
        }
        hasReceivedEose.current = true;
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
        unreadCount,
        hasUnread,
        showNotifications,
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
