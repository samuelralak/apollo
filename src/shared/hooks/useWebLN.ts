import { useState, useCallback } from 'react';
import { useMountEffect, useIsMounted } from '@react-hookz/web';

interface UseWebLNResult {
    isEnabled: boolean;
    isAvailable: boolean;
    sendPayment: (invoice: string) => Promise<void>;
    error: Error | null;
}

/**
 * Hook to manage WebLN browser extension integration
 */
const useWebLN = (): UseWebLNResult => {
    const [isEnabled, setIsEnabled] = useState(false);
    const [error, setError] = useState<Error | null>(null);
    const isMounted = useIsMounted();
    const { webln } = window;

    useMountEffect(() => {
        if (!webln) return;

        webln.enable()
            .then(() => {
                if (isMounted()) setIsEnabled(true);
            })
            .catch((e: unknown) => {
                if (!isMounted()) return;
                if (e instanceof Error) setError(e);
            });
    });

    const sendPayment = useCallback(async (invoice: string) => {
        if (!webln || !isEnabled) {
            throw new Error('WebLN not available');
        }
        await webln.sendPayment(invoice);
    }, [webln, isEnabled]);

    return {
        isEnabled,
        isAvailable: !!webln,
        sendPayment,
        error
    };
};

export default useWebLN;
