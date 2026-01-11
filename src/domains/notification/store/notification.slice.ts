import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import type {
    Notification,
    NotificationState,
    NotificationSettings
} from "../types/notification.types";
import {
    NotificationCategory,
    NOTIFICATION_STORAGE_KEYS,
    DEFAULT_NOTIFICATION_SETTINGS
} from "../types/notification.types";

/**
 * Load last read timestamp from localStorage
 */
const loadLastReadTimestamp = (): number => {
    try {
        const stored = localStorage.getItem(NOTIFICATION_STORAGE_KEYS.LAST_READ);
        if (stored) {
            return parseInt(stored, 10);
        }
    } catch {
        // localStorage not available
    }
    return 0;
};

/**
 * Load notification settings from localStorage
 */
const loadSettings = (): NotificationSettings => {
    try {
        const stored = localStorage.getItem(NOTIFICATION_STORAGE_KEYS.SETTINGS);
        if (stored) {
            const parsed = JSON.parse(stored);
            // Merge with defaults to ensure all keys exist
            return {
                ...DEFAULT_NOTIFICATION_SETTINGS,
                ...parsed,
                enabled: {
                    ...DEFAULT_NOTIFICATION_SETTINGS.enabled,
                    ...parsed.enabled
                }
            };
        }
    } catch {
        // localStorage not available or parse error
    }
    return DEFAULT_NOTIFICATION_SETTINGS;
};

/**
 * Save last read timestamp to localStorage
 */
const saveLastReadTimestamp = (timestamp: number): void => {
    try {
        localStorage.setItem(NOTIFICATION_STORAGE_KEYS.LAST_READ, timestamp.toString());
    } catch {
        // localStorage not available
    }
};

/**
 * Save notification settings to localStorage
 */
const saveSettings = (settings: NotificationSettings): void => {
    try {
        localStorage.setItem(NOTIFICATION_STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
    } catch {
        // localStorage not available
    }
};

/** Maximum number of notifications to store */
const MAX_NOTIFICATIONS = 200;

const initialState: NotificationState = {
    byId: {},
    ids: [],
    lastReadTimestamp: loadLastReadTimestamp(),
    loading: false,
    initialized: false,
    settings: loadSettings(),
    error: null
};

/**
 * Insert notification ID in sorted position (newest first)
 */
const insertSorted = (ids: string[], byId: Record<string, Notification>, newId: string): string[] => {
    const newNotification = byId[newId];
    if (!newNotification) return ids;

    // Find insertion point (binary search for efficiency)
    let low = 0;
    let high = ids.length;

    while (low < high) {
        const mid = Math.floor((low + high) / 2);
        const midNotification = byId[ids[mid]];
        if (midNotification && midNotification.createdAt > newNotification.createdAt) {
            low = mid + 1;
        } else {
            high = mid;
        }
    }

    const result = [...ids];
    result.splice(low, 0, newId);
    return result;
};

/**
 * Prune notifications to stay within MAX_NOTIFICATIONS limit
 * Removes oldest notifications first
 */
const pruneNotifications = (
    ids: string[],
    byId: Record<string, Notification>
): { ids: string[]; byId: Record<string, Notification> } => {
    if (ids.length <= MAX_NOTIFICATIONS) {
        return { ids, byId };
    }

    // Keep only the newest MAX_NOTIFICATIONS
    const prunedIds = ids.slice(0, MAX_NOTIFICATIONS);

    // Create new byId with only the kept notifications
    const prunedById: Record<string, Notification> = {};
    for (const id of prunedIds) {
        if (byId[id]) {
            prunedById[id] = byId[id];
        }
    }

    return { ids: prunedIds, byId: prunedById };
};

const notificationSlice = createSlice({
    name: 'notification',
    initialState,
    reducers: {
        /**
         * Add a single notification, maintaining sorted order
         * For follow notifications (which are deduplicated by actor), update if newer
         */
        addNotification: (state, { payload }: PayloadAction<Notification>) => {
            const existing = state.byId[payload.id];

            if (existing) {
                // For follow notifications, update if the new event is more recent
                if (payload.id.startsWith('follow:') && payload.createdAt > existing.createdAt) {
                    state.byId[payload.id] = payload;
                    // Re-sort since timestamp changed
                    state.ids = state.ids.filter(id => id !== payload.id);
                    state.ids = insertSorted(state.ids, state.byId, payload.id);
                }
                // Otherwise skip duplicates
                return;
            }

            state.byId[payload.id] = payload;
            state.ids = insertSorted(state.ids, state.byId, payload.id);

            // Prune if over limit
            const pruned = pruneNotifications(state.ids, state.byId);
            state.ids = pruned.ids;
            state.byId = pruned.byId;
        },

        /**
         * Add multiple notifications in batch
         */
        addNotifications: (state, { payload }: PayloadAction<Notification[]>) => {
            let idsChanged = false;

            for (const notification of payload) {
                const existing = state.byId[notification.id];

                if (existing) {
                    // For follow notifications, update if newer (same as addNotification)
                    if (notification.id.startsWith('follow:') && notification.createdAt > existing.createdAt) {
                        state.byId[notification.id] = notification;
                        idsChanged = true;
                    }
                    // Otherwise skip duplicates
                    continue;
                }

                state.byId[notification.id] = notification;
                idsChanged = true;
            }

            // Re-sort entire list if we added/updated any
            if (idsChanged) {
                state.ids = Object.keys(state.byId).sort((a, b) => {
                    const notifA = state.byId[a];
                    const notifB = state.byId[b];
                    return (notifB?.createdAt ?? 0) - (notifA?.createdAt ?? 0);
                });

                // Prune if over limit
                const pruned = pruneNotifications(state.ids, state.byId);
                state.ids = pruned.ids;
                state.byId = pruned.byId;
            }
        },

        /**
         * Mark all notifications as read by updating timestamp
         */
        markAllRead: (state) => {
            const now = Math.floor(Date.now() / 1000);
            state.lastReadTimestamp = now;
            saveLastReadTimestamp(now);
        },

        /**
         * Mark notifications as read up to a specific timestamp
         */
        markReadUntil: (state, { payload }: PayloadAction<number>) => {
            if (payload > state.lastReadTimestamp) {
                state.lastReadTimestamp = payload;
                saveLastReadTimestamp(payload);
            }
        },

        /**
         * Clear all notifications
         */
        clearNotifications: (state) => {
            state.byId = {};
            state.ids = [];
        },

        /**
         * Update notification settings
         */
        updateSettings: (state, { payload }: PayloadAction<Partial<NotificationSettings>>) => {
            state.settings = {
                ...state.settings,
                ...payload,
                enabled: {
                    ...state.settings.enabled,
                    ...(payload.enabled ?? {})
                }
            };
            saveSettings(state.settings);
        },

        /**
         * Toggle a specific category
         */
        toggleCategory: (state, { payload }: PayloadAction<NotificationCategory>) => {
            state.settings.enabled[payload] = !state.settings.enabled[payload];
            saveSettings(state.settings);
        },

        /**
         * Set loading state
         */
        setLoading: (state, { payload }: PayloadAction<boolean>) => {
            state.loading = payload;
        },

        /**
         * Mark as initialized
         */
        setInitialized: (state) => {
            state.initialized = true;
            state.loading = false;
        },

        /**
         * Set error state
         */
        setError: (state, { payload }: PayloadAction<string | null>) => {
            state.error = payload;
            state.loading = false;
        },

        /**
         * Reset notifications on logout
         */
        resetNotifications: () => {
            // Clear stored data
            try {
                localStorage.removeItem(NOTIFICATION_STORAGE_KEYS.LAST_READ);
                localStorage.removeItem(NOTIFICATION_STORAGE_KEYS.SETTINGS);
            } catch {
                // localStorage not available
            }
            return {
                ...initialState,
                lastReadTimestamp: 0,
                settings: DEFAULT_NOTIFICATION_SETTINGS
            };
        }
    }
});

export const {
    addNotification,
    addNotifications,
    markAllRead,
    markReadUntil,
    clearNotifications,
    updateSettings,
    toggleCategory,
    setLoading,
    setInitialized,
    setError,
    resetNotifications
} = notificationSlice.actions;

export type { NotificationState };
export default notificationSlice.reducer;
