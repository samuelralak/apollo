import NDK, {NDKEvent, NDKNip07Signer, NDKPrivateKeySigner, NDKSigner} from "@nostr-dev-kit/ndk";
import {createContext, ReactNode, useEffect, useRef, useState} from "react";
import Loader from "../../shared/components/feedback/Loader";
import {useSelector} from "react-redux";
import {RootState} from "../../app/store";
import {SignerMethod} from "../../domains/auth/store/auth.slice";
import secureLocalStorage from "react-secure-storage";
import constants from "../../constants";
import {decodeNsec} from "../../utils";

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
    const ndk = useRef<NDK | undefined>(undefined)
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
                setNDKConnected(true)
            } else {
                console.warn('No relays connected, but proceeding anyway')
                setNDKConnected(true) // Still allow app to load
            }
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

    const signer = (): NDKSigner | null => {
        if (auth.signerMethod === SignerMethod.NIP07) {
            return (new NDKNip07Signer(3000))
        }

        if (auth.signerMethod === SignerMethod.PRIVATE_KEY) {
            const {nsec} = secureLocalStorage.getItem(constants.secureStorageKey) as { nsec: string }
            const decodedKey = decodeNsec(nsec as `nsec1${string}`)
            return (new NDKPrivateKeySigner(decodedKey as unknown as string))
        }

        return null
    }

    const ndkInstance = (): NDK => ndk.current!
    const removeNDKSigner = () => setNDKSigner(undefined)

    const setNDKSigner = (signer?: NDKSigner | undefined) => {
        if (signer) {
            ndk.current!.signer = signer
        } else {
            switch (auth.signerMethod) {
                case SignerMethod.NIP07: {
                    setNDKSigner(new NDKNip07Signer(3000))
                    break;
                }
                case SignerMethod.PRIVATE_KEY: {
                    const {nsec} = secureLocalStorage.getItem(constants.secureStorageKey) as { nsec: string }
                    const decodedKey = decodeNsec(nsec as `nsec1${string}`)
                    setNDKSigner(new NDKPrivateKeySigner(decodedKey as unknown as string))
                    break;
                }
                default:
                    ndk.current!.signer = undefined
            }
        }
    }

    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect -- Initial connection to external NDK service
        connectNDK().catch(console.error)
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
