import NDK, {NDKEvent, NDKNip07Signer, NDKPrivateKeySigner, NDKSigner} from "@nostr-dev-kit/ndk";
import {createContext, ReactNode, useEffect, useRef, useState, useCallback} from "react";
import Loader from "../../shared/components/feedback/Loader";
import {useSelector, useDispatch} from "react-redux";
import {RootState, AppDispatch} from "../../app/store";
import {SignerMethod} from "../../domains/auth/store/auth.slice";
import secureLocalStorage from "react-secure-storage";
import constants from "../../constants";
import {decodeNsec} from "../../utils";
import {SubscriptionManager} from "../subscriptions";

export interface NDKContext {
    signer: () => NDKSigner | null,
    ndkConnected: boolean,
    ndkInstance: () => NDK,
    setNDKSigner: (signer?: NDKSigner) => void,
    removeNDKSigner: () => void,
    buildEvent: (kind: number, content: string, tags?: string[][]) => NDKEvent
    publishEvent: (kind: number, content: string, tags?: string[][]) => Promise<string>
}

const relays = [...constants.explicitRelays]

export const NDKContext = createContext<NDKContext | null>(null)

const NDKProvider = ({children}: { children: ReactNode }) => {
    const auth = useSelector((state: RootState) => state.auth)
    const dispatch = useDispatch<AppDispatch>()
    const ndk = useRef<NDK | undefined>(undefined)
    const currentSignerRef = useRef<NDKSigner | null>(null)
    const [ndkConnected, setNDKConnected] = useState<boolean>(false)

    const connectNDK = async () => {
        try {
            ndk.current = new NDK({explicitRelayUrls: relays});
            await ndk.current.connect(5000)

            // Wait a bit for relays to establish connections, then check if any connected
            await new Promise(resolve => setTimeout(resolve, 1000))

            const connectedRelays = Array.from(ndk.current.pool.relays.values())
                .filter(relay => relay.connectivity.status === 1)

            if (connectedRelays.length > 0) {
                console.log(`Connected to ${connectedRelays.length} relay(s)`)
            } else {
                console.warn('No relays connected, but proceeding anyway')
            }

            // Initialize SubscriptionManager after NDK connects
            const subscriptionManager = SubscriptionManager.getInstance();
            subscriptionManager.initialize(ndk.current, dispatch);
            console.log('SubscriptionManager initialized');

            setNDKConnected(true)
        } catch (error) {
            console.error('NDK connection error:', error)
            setNDKConnected(true) // Allow app to load even on error
        }
    }

    const buildEvent = (kind: number, content: string, tags?: string[][]): NDKEvent => {
        const ndkEvent = new NDKEvent(ndk.current)
        ndkEvent.kind = kind
        ndkEvent.content = content
        ndkEvent.tags = tags ?? []

        return ndkEvent
    }

    const publishEvent = async (kind: number, content: string, tags?: string[][]) => {
        if (!ndkInstance().signer) {
            setNDKSigner()
        }
        const ndkEvent = new NDKEvent(ndk.current)
        ndkEvent.kind = kind
        ndkEvent.content = content
        ndkEvent.tags = tags ?? []

        await ndkEvent.publish()
        return ndkEvent.id
    }

    // Helper function to create signer based on auth method - single source of truth
    const createSigner = useCallback((): NDKSigner | null => {
        if (auth.signerMethod === SignerMethod.NIP07) {
            return new NDKNip07Signer(3000)
        }

        if (auth.signerMethod === SignerMethod.PRIVATE_KEY) {
            const {nsec} = secureLocalStorage.getItem(constants.secureStorageKey) as { nsec: string }
            const decodedKey = decodeNsec(nsec as `nsec1${string}`)
            return new NDKPrivateKeySigner(decodedKey as unknown as string)
        }

        return null
    }, [auth.signerMethod])

    // Returns cached signer instance
    const signer = (): NDKSigner | null => currentSignerRef.current

    const ndkInstance = (): NDK => ndk.current!

    // Set or clear the NDK signer - non-recursive, clear logic
    const setNDKSigner = useCallback((signerInstance?: NDKSigner) => {
        // Use provided signer or create one based on auth method
        const signerToSet = signerInstance ?? createSigner()

        // Update NDK and cache
        ndk.current!.signer = signerToSet ?? undefined
        currentSignerRef.current = signerToSet
    }, [createSigner])

    const removeNDKSigner = useCallback(() => {
        ndk.current!.signer = undefined
        currentSignerRef.current = null
    }, [])

    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect -- Initial connection to external NDK service
        connectNDK().catch(console.error)

        // Cleanup on unmount
        return () => {
            const subscriptionManager = SubscriptionManager.getInstance();
            subscriptionManager.destroy();
        }
    }, [])

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
