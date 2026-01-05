import NDK, {NDKEvent, NDKNip07Signer, NDKPrivateKeySigner, NDKSigner} from "@nostr-dev-kit/ndk";
import {createContext, ReactNode, useRef, useState, useCallback} from "react";
import {useMountEffect, useUnmountEffect} from "@react-hookz/web";
import Loader from "../../shared/components/feedback/Loader";
import {useSelector, useDispatch} from "react-redux";
import {RootState, AppDispatch} from "../../app/store";
import {SignerMethod} from "../../domains/auth/store/auth.slice";
import secureLocalStorage from "react-secure-storage";
import constants from "../../constants";
import {decodeNsec} from "../../utils";
import {SubscriptionManager} from "../subscriptions";

export interface NDKContext {
    signer: () => NDKSigner | null;
    ndkConnected: boolean;
    ndkInstance: () => NDK;
    setNDKSigner: (signer?: NDKSigner) => void;
    removeNDKSigner: () => void;
    buildEvent: (kind: number, content: string, tags?: string[][]) => NDKEvent;
    publishEvent: (kind: number, content: string, tags?: string[][]) => Promise<string>;
}

export const NDKContext = createContext<NDKContext | null>(null)

const NDKProvider = ({children}: { children: ReactNode }) => {
    const auth = useSelector((state: RootState) => state.auth)
    const dispatch = useDispatch<AppDispatch>()
    const ndkRef = useRef<NDK | undefined>(undefined)
    const signerRef = useRef<NDKSigner | null>(null)
    const [ndkConnected, setNDKConnected] = useState(false)

    const ndkInstance = (): NDK => ndkRef.current!
    const signer = (): NDKSigner | null => signerRef.current

    const connectNDK = async () => {
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
            setNDKConnected(true)
        } catch (error) {
            console.error('NDK connection error:', error)
            setNDKConnected(true)
        }
    }

    const buildEvent = (kind: number, content: string, tags: string[][] = []): NDKEvent => {
        const event = new NDKEvent(ndkRef.current)
        event.kind = kind
        event.content = content
        event.tags = tags
        return event
    }

    const publishEvent = async (kind: number, content: string, tags: string[][] = []): Promise<string> => {
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
    }

    // Create signer based on auth method with NIP-07 fallback
    const createSigner = useCallback((): NDKSigner | null => {
        if (auth.signerMethod === SignerMethod.PRIVATE_KEY) {
            const stored = secureLocalStorage.getItem(constants.secureStorageKey) as { nsec?: string; privkey?: string } | null
            const key = stored?.nsec ? decodeNsec(stored.nsec as `nsec1${string}`) : stored?.privkey

            if (key) return new NDKPrivateKeySigner(key as string)

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

    const setNDKSigner = useCallback((signerInstance?: NDKSigner) => {
        const newSigner = signerInstance ?? createSigner()
        ndkRef.current!.signer = newSigner ?? undefined
        signerRef.current = newSigner
    }, [createSigner])

    const removeNDKSigner = useCallback(() => {
        ndkRef.current!.signer = undefined
        signerRef.current = null
    }, [])

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
        <NDKContext.Provider value={{signer, ndkConnected, ndkInstance, setNDKSigner, removeNDKSigner, buildEvent, publishEvent}}>
            {children}
        </NDKContext.Provider>
    )
}

export default NDKProvider
