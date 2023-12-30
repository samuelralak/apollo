import {NDKEvent, NDKFilter, NDKSubscription, NDKSubscriptionOptions} from "@nostr-dev-kit/ndk";
import {useContext, useEffect, useState} from "react";
import {NDKContext} from "../components/NDKProvider.tsx";

const useNDKSubscription = (filters: NDKFilter | NDKFilter[], opts?: NDKSubscriptionOptions, callbackFn?: (event: NDKEvent) => void) => {
    const {ndkInstance} = useContext(NDKContext) as NDKContext
    const [ndkSubscription, setNDKSubscription] = useState<NDKSubscription | undefined>()

    useEffect(() => {
        (async () => {
            const defaultOpts = {...{closeOnEose: true}, ...(opts ?? {})}
            const subscription = ndkInstance().subscribe(filters, defaultOpts);
            // await subscription.start()
            setNDKSubscription(subscription)

            subscription.on('event', (event: NDKEvent) => callbackFn?.(event))
        })()

        return () => {
            ndkSubscription?.stop()
        }
    }, []);
}

export default useNDKSubscription
