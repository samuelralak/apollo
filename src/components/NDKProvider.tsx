import NDK, {NDKEvent, NDKNip07Signer, NDKSigner} from "@nostr-dev-kit/ndk";
import {createContext, ReactNode, useEffect, useRef, useState} from "react";
import Loader from "./Loader.tsx";

export interface NDKContext {
    ndkConnected: boolean,
    ndkInstance: () => NDK,
    setNDKSigner: (signer?: NDKSigner) => void,
    removeNDKSigner: () => void,
    publishEvent: (kind: number, content: string, tags?: string[][]) => Promise<string>
}

const relays = [
    'wss://relay.nostrosity.com',
    // 'wss://relay.damus.io',
    // 'wss://relay.primal.net',
    // 'wss://relay.nos.social',
    // 'wss://relay.nostr.band'
]

export const NDKContext = createContext<NDKContext | null>(null)

const NDKProvider = ({children}: { children: ReactNode }) => {
    const ndk = useRef<NDK | undefined>()
    const [ndkConnected, setNDKConnected] = useState<boolean>(false)

    const connectNDK = async () => {
        try {
            ndk.current = new NDK({explicitRelayUrls: relays});
            ndk.current.connect(3000)
            setNDKConnected(true)
        } catch (e) {
            setNDKConnected(false)
        }
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

    const ndkInstance = (): NDK => ndk.current!
    const removeNDKSigner = () => setNDKSigner(undefined)

    const setNDKSigner = (signer?: NDKSigner | undefined) => {
        if (signer) {
            ndk.current!.signer = signer
        } else {
            const nipO7Singer = new NDKNip07Signer(3000)
            setNDKSigner(nipO7Singer)
        }
    }

    useEffect(() => {
        connectNDK().catch(console.error)
    }, [])

    if (!ndkConnected) {
        return <Loader loadingText={'Connecting'}/>
    }

    return (
        <NDKContext.Provider value={{ndkConnected, ndkInstance, setNDKSigner, removeNDKSigner, publishEvent}}>
            {children}
        </NDKContext.Provider>
    )
}

export default NDKProvider
