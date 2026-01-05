import { useState, useCallback, useContext } from 'react';
import { useIsMounted } from '@react-hookz/web';
import { NDKZapper } from '@nostr-dev-kit/ndk';
import { nip19 } from 'nostr-tools';
import { NDKContext } from '../../lib/ndk/NDKProvider';

interface ZapOptions {
    pubkey: string;
    amount: number;
    comment?: string;
    eventId?: string;
    eventCoordinate?: string;
}

interface UseZapInvoiceResult {
    invoice: string | null;
    isGenerating: boolean;
    error: Error | null;
    generateInvoice: (options: Omit<ZapOptions, 'pubkey'>) => Promise<string | null>;
    clearInvoice: () => void;
}

/**
 * Hook to generate Lightning invoices for zaps
 */
const useZapInvoice = (pubkey: string): UseZapInvoiceResult => {
    const { ndkInstance } = useContext(NDKContext) as NDKContext;
    const isMounted = useIsMounted();

    const [invoice, setInvoice] = useState<string | null>(null);
    const [isGenerating, setIsGenerating] = useState(false);
    const [error, setError] = useState<Error | null>(null);

    const clearInvoice = useCallback(() => {
        setInvoice(null);
        setError(null);
    }, []);

    const generateInvoice = useCallback(async ({ amount, comment, eventId, eventCoordinate }: Omit<ZapOptions, 'pubkey'>): Promise<string | null> => {
        setIsGenerating(true);
        setError(null);

        try {
            const ndk = ndkInstance();
            const recipient = ndk.getUser({ npub: nip19.npubEncode(pubkey) });
            const millisats = amount * 1000;

            const tags: string[][] = [
                ...(eventId ? [['e', eventId]] : []),
                ...(eventCoordinate ? [['a', eventCoordinate]] : [])
            ];

            const zapper = new NDKZapper(recipient, millisats, 'msat', { comment, tags });
            zapper.ndk = ndk;

            let generatedInvoice: string | null = null;
            zapper.on('ln_invoice', ({ pr }) => {
                generatedInvoice = pr;
            });

            await zapper.zap();

            if (!isMounted()) return null;

            if (generatedInvoice) {
                setInvoice(generatedInvoice);
            }

            return generatedInvoice;
        } catch (e) {
            if (!isMounted()) return null;
            const err = e instanceof Error ? e : new Error('Failed to generate invoice');
            setError(err);
            return null;
        } finally {
            if (isMounted()) {
                setIsGenerating(false);
            }
        }
    }, [ndkInstance, pubkey, isMounted]);

    return {
        invoice,
        isGenerating,
        error,
        generateInvoice,
        clearInvoice
    };
};

export default useZapInvoice;
