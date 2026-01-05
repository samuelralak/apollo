import { useState, useCallback, useRef, useContext } from 'react';
import { useIntervalEffect, useIsMounted } from '@react-hookz/web';
import { NDKContext } from '../../lib/ndk/NDKProvider';
import { tagFromEvents } from '../../utils';

const MAX_POLL_ATTEMPTS = 30;
const POLL_INTERVAL_MS = 2000;

interface UseZapReceiptOptions {
    pubkey: string;
    onReceived: () => void;
}

interface UseZapReceiptResult {
    startPolling: (invoice: string) => void;
    stopPolling: () => void;
    isPolling: boolean;
}

/**
 * Hook to poll for zap receipt confirmation
 */
const useZapReceipt = ({ pubkey, onReceived }: UseZapReceiptOptions): UseZapReceiptResult => {
    const { ndkInstance } = useContext(NDKContext) as NDKContext;
    const isMounted = useIsMounted();

    const [isPolling, setIsPolling] = useState(false);
    const invoiceRef = useRef<string | null>(null);
    const attemptCountRef = useRef(0);

    const stopPolling = useCallback(() => {
        setIsPolling(false);
        invoiceRef.current = null;
        attemptCountRef.current = 0;
    }, []);

    const startPolling = useCallback((invoice: string) => {
        invoiceRef.current = invoice;
        attemptCountRef.current = 0;
        setIsPolling(true);
    }, []);

    useIntervalEffect(
        async () => {
            if (!invoiceRef.current) return;

            attemptCountRef.current += 1;

            // Stop after max attempts
            if (attemptCountRef.current >= MAX_POLL_ATTEMPTS) {
                stopPolling();
                return;
            }

            try {
                const event = await ndkInstance().fetchEvent({
                    kinds: [9735],
                    since: Math.floor(Date.now() / 1000) - 5,
                    "#p": [pubkey]
                });

                if (!isMounted()) return;

                if (event) {
                    const tags = tagFromEvents(event.tags);
                    if (tags['bolt11']?.[0] === invoiceRef.current) {
                        stopPolling();
                        onReceived();
                    }
                }
            } catch {
                // Silently continue polling on fetch errors
            }
        },
        isPolling ? POLL_INTERVAL_MS : undefined
    );

    return { startPolling, stopPolling, isPolling };
};

export default useZapReceipt;
