import { useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "../../../app/store";
import {
    updateSettings,
    toggleCategory
} from "../store/notification.slice";
import type { NotificationSettings } from "../types/notification.types";
import { NotificationCategory, DEFAULT_NOTIFICATION_SETTINGS } from "../types/notification.types";

interface UseNotificationSettingsReturn {
    /** Current notification settings */
    settings: NotificationSettings;
    /** Toggle a specific category on/off */
    toggleCategoryEnabled: (category: NotificationCategory) => void;
    /** Set a category to specific enabled state */
    setCategoryEnabled: (category: NotificationCategory, enabled: boolean) => void;
    /** Toggle in-app notifications */
    toggleInApp: () => void;
    /** Toggle aggregation of similar notifications */
    toggleAggregate: () => void;
    /** Reset to default settings */
    resetSettings: () => void;
    /** Check if a category is enabled */
    isCategoryEnabled: (category: NotificationCategory) => boolean;
}

/**
 * Hook for managing notification settings
 *
 * Features:
 * - Enable/disable notification categories
 * - Toggle in-app notifications
 * - Toggle notification aggregation
 * - Persisted to localStorage
 */
const useNotificationSettings = (): UseNotificationSettingsReturn => {
    const dispatch = useDispatch<AppDispatch>();

    // Notification settings from state
    const settings = useSelector((state: RootState) => state.notification.settings);

    // Toggle category on/off
    const toggleCategoryEnabled = useCallback((category: NotificationCategory) => {
        dispatch(toggleCategory(category));
    }, [dispatch]);

    // Set specific category state
    const setCategoryEnabled = useCallback((category: NotificationCategory, enabled: boolean) => {
        dispatch(updateSettings({
            enabled: {
                ...settings.enabled,
                [category]: enabled
            }
        }));
    }, [dispatch, settings.enabled]);

    // Toggle in-app notifications
    const toggleInApp = useCallback(() => {
        dispatch(updateSettings({
            showInApp: !settings.showInApp
        }));
    }, [dispatch, settings.showInApp]);

    // Toggle aggregation
    const toggleAggregate = useCallback(() => {
        dispatch(updateSettings({
            aggregateSimilar: !settings.aggregateSimilar
        }));
    }, [dispatch, settings.aggregateSimilar]);

    // Reset to defaults
    const resetSettings = useCallback(() => {
        dispatch(updateSettings(DEFAULT_NOTIFICATION_SETTINGS));
    }, [dispatch]);

    // Check if category is enabled
    const isCategoryEnabled = useCallback((category: NotificationCategory): boolean => {
        return settings.enabled[category];
    }, [settings.enabled]);

    return {
        settings,
        toggleCategoryEnabled,
        setCategoryEnabled,
        toggleInApp,
        toggleAggregate,
        resetSettings,
        isCategoryEnabled
    };
};

export default useNotificationSettings;
