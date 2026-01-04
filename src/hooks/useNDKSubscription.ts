import {NDKEvent, NDKFilter, NDKSubscription, NDKSubscriptionOptions} from "@nostr-dev-kit/ndk";
import {useContext, useEffect, useRef, useState} from "react";
import {NDKContext} from "../components/NDKProvider.tsx";

const EOSE_TIMEOUT_MS = 10000 // 10 seconds timeout for EOSE

const useNDKSubscription = (filters: NDKFilter | NDKFilter[], opts?: NDKSubscriptionOptions, callbackFn?: (event: NDKEvent) => void, eoseFn?: () => void) => {
    const {ndkInstance} = useContext(NDKContext) as NDKContext
    const [ndkSubscription, setNDKSubscription] = useState<NDKSubscription | undefined>()
    const eoseCalled = useRef(false)

    useEffect(() => {
        let timeoutId: ReturnType<typeof setTimeout>

        const handleEose = () => {
            if (!eoseCalled.current) {
                eoseCalled.current = true
                clearTimeout(timeoutId)
                eoseFn?.()
            }
        }

        (async () => {
            const defaultOpts = {...{closeOnEose: true}, ...(opts ?? {})}
            const subscription = ndkInstance().subscribe(filters, defaultOpts);
            setNDKSubscription(subscription)

            subscription.on('event', (event: NDKEvent) => callbackFn?.(event))
            subscription.on('eose', handleEose)

            // Fallback timeout in case EOSE never fires
            timeoutId = setTimeout(() => {
                if (!eoseCalled.current) {
                    console.warn('EOSE timeout reached, proceeding anyway')
                    handleEose()
                }
            }, EOSE_TIMEOUT_MS)
        })()

        return () => {
            clearTimeout(timeoutId)
            ndkSubscription?.stop()
        }
    }, []);
}

export default useNDKSubscription
