import NDK, {NDKEvent, NDKNip07Signer, NDKPrivateKeySigner, NDKSigner} from "@nostr-dev-kit/ndk";
import {createContext, ReactNode, useRef, useState, useCallback, useMemo} from "react";
import {useMountEffect, useUnmountEffect, useUpdateEffect} from "@react-hookz/web";
import Loader from "../../shared/components/feedback/Loader";
import {useSelector, useDispatch} from "react-redux";
import {RootState, AppDispatch} from "../../app/store";
import {SignerMethod} from "../../domains/auth/store/auth.slice";
import secureLocalStorage from "react-secure-storage";
import constants from "../../constants";
import {decodeNsec} from "../../utils";
import {SubscriptionManager} from "../subscriptions";

export interface RelayInfo {
    url: string;
    status: 'connected' | 'connecting' | 'disconnected';
}

export interface NDKContext {
    signer: NDKSigner | null;
    ndkConnected: boolean;
    ndkInstance: () => NDK;
    setNDKSigner: (signer?: NDKSigner) => void;
    removeNDKSigner: () => void;
    buildEvent: (kind: number, content: string, tags?: string[][]) => NDKEvent;
    publishEvent: (kind: number, content: string, tags?: string[][]) => Promise<string>;
    getRelays: () => RelayInfo[];
}

export const NDKContext = createContext<NDKContext | null>(null)

const NDKProvider = ({children}: { children: ReactNode }) => {
    const auth = useSelector((state: RootState) => state.auth)
    const dispatch = useDispatch<AppDispatch>()
    const ndkRef = useRef<NDK | undefined>(undefined)
    const [activeSigner, setActiveSigner] = useState<NDKSigner | null>(null)
    const [ndkConnected, setNDKConnected] = useState(false)

    const ndkInstance = useCallback((): NDK => {
        if (!ndkRef.current) {
            throw new Error('NDK not initialized');
        }
        return ndkRef.current;
    }, [])

    // Create signer based on auth method with NIP-07 fallback
    const createSigner = useCallback((): NDKSigner | null => {
        if (auth.signerMethod === SignerMethod.PRIVATE_KEY) {
            try {
                const stored = secureLocalStorage.getItem(constants.secureStorageKey) as { nsec?: string; privkey?: string } | null
                const key = stored?.nsec ? decodeNsec(stored.nsec as `nsec1${string}`) : stored?.privkey

                if (key) return new NDKPrivateKeySigner(key as string)
            } catch (error) {
                console.error('Failed to restore signer from storage:', error)
            }

            // Clear stale encrypted data if decryption failed
            const rawKey = `@secure.j.${constants.secureStorageKey}`
            if (localStorage.getItem(rawKey)) {
                console.warn('Private key decryption failed. Clearing stale data.')
                localStorage.removeItem(rawKey)
            }
        }

        // NIP-07 extension as primary or fallback
        if (auth.signerMethod === SignerMethod.NIP07 || window.nostr) {
            return new NDKNip07Signer(3000)
        }

        return null
    }, [auth.signerMethod])

    const connectNDK = useCallback(async () => {
        try {
            ndkRef.current = new NDK({ explicitRelayUrls: constants.explicitRelays })
            await ndkRef.current.connect(5000)
            await new Promise(resolve => setTimeout(resolve, 1000))

            const connected = Array.from(ndkRef.current.pool.relays.values())
                .filter(r => r.connectivity.status === 1)

            if (connected.length === 0) {
                console.warn('No relays connected, proceeding anyway')
            }

            SubscriptionManager.getInstance().initialize(ndkRef.current, dispatch)

            // Restore signer if user was logged in
            if (auth.isLoggedIn && auth.signerMethod) {
                const restoredSigner = createSigner()
                if (restoredSigner) {
                    ndkRef.current.signer = restoredSigner
                    setActiveSigner(restoredSigner)
                }
            }

            setNDKConnected(true)
        } catch (error) {
            console.error('NDK connection error:', error)
            setNDKConnected(true)
        }
    }, [auth.isLoggedIn, auth.signerMethod, createSigner, dispatch])

    const buildEvent = useCallback((kind: number, content: string, tags: string[][] = []): NDKEvent => {
        const event = new NDKEvent(ndkRef.current)
        event.kind = kind
        event.content = content
        event.tags = tags
        return event
    }, [])

    const setNDKSigner = useCallback((signerInstance?: NDKSigner) => {
        const newSigner = signerInstance ?? createSigner()
        if (ndkRef.current) {
            ndkRef.current.signer = newSigner ?? undefined
        }
        setActiveSigner(newSigner)
    }, [createSigner])

    const removeNDKSigner = useCallback(() => {
        if (ndkRef.current) {
            ndkRef.current.signer = undefined
        }
        setActiveSigner(null)
    }, [])

    // Auto-sync NDK signer when Redux auth state changes (skips initial mount)
    useUpdateEffect(() => {
        // Wait for connection before syncing auth state
        if (!ndkConnected) return

        if (auth.isLoggedIn && !activeSigner) {
            setNDKSigner()
        } else if (!auth.isLoggedIn && activeSigner) {
            removeNDKSigner()
        }
    }, [auth.isLoggedIn, activeSigner, setNDKSigner, removeNDKSigner, ndkConnected])

    const publishEvent = useCallback(async (kind: number, content: string, tags: string[][] = []): Promise<string> => {
        if (!ndkInstance().signer) setNDKSigner()

        const currentSigner = ndkInstance().signer
        if (!currentSigner) {
            throw new Error('No signer available. Please log in again.')
        }

        // Wait for NIP-07 extension to be ready
        if ('blockUntilReady' in currentSigner) {
            await (currentSigner as NDKNip07Signer).blockUntilReady()
        }

        const event = buildEvent(kind, content, tags)
        await event.publish()
        return event.id
    }, [ndkInstance, setNDKSigner, buildEvent])

    const getRelays = useCallback((): RelayInfo[] => {
        if (!ndkRef.current) return [];
        return Array.from(ndkRef.current.pool.relays.entries()).map(([url, relay]) => ({
            url,
            status: relay.connectivity.status === 1 ? 'connected'
                : relay.connectivity.status === 0 ? 'connecting'
                : 'disconnected'
        }));
    }, []);

    // Memoize context value to prevent unnecessary re-renders
    const contextValue = useMemo<NDKContext>(() => ({
        signer: activeSigner,
        ndkConnected,
        ndkInstance,
        setNDKSigner,
        removeNDKSigner,
        buildEvent,
        publishEvent,
        getRelays
    }), [activeSigner, ndkConnected, ndkInstance, setNDKSigner, removeNDKSigner, buildEvent, publishEvent, getRelays]);

    useMountEffect(() => {
        connectNDK().catch(console.error)
    })

    useUnmountEffect(() => {
        SubscriptionManager.getInstance().destroy()
    })

    if (!ndkConnected) {
        return <Loader loadingText={'Connecting'}/>
    }

    return (
        <NDKContext.Provider value={contextValue}>
            {children}
        </NDKContext.Provider>
    )
}

export default NDKProvider
