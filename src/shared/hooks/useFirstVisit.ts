import {useLocalStorageValue} from '@react-hookz/web';

const WELCOME_SEEN_KEY = 'apollo-welcome-seen';

/**
 * Hook for detecting and managing first-time visitor state.
 * Uses localStorage to persist whether user has seen the welcome modal.
 */
const useFirstVisit = () => {
    const {value: hasSeenWelcome, set: setHasSeenWelcome} = useLocalStorageValue<boolean>(
        WELCOME_SEEN_KEY,
        {defaultValue: false}
    );

    const isFirstVisit = !hasSeenWelcome;
    const markWelcomeSeen = () => setHasSeenWelcome(true);

    return {isFirstVisit, markWelcomeSeen};
};

export default useFirstVisit;
