import {NDKUserProfile} from "@nostr-dev-kit/ndk";
import {useContext, useEffect, useState} from "react";
import {NDKContext} from "../NDKProvider.tsx";

const EventOwner = ({pubkey}: { pubkey: string }) => {
    const {ndkInstance} = useContext(NDKContext) as NDKContext
    const [userProfile, setUserEvent] = useState<NDKUserProfile | null>()

    useEffect(() => {
        (async () => {
            const userEvent = await ndkInstance().fetchEvent({kinds: [0], authors: [pubkey]})
            if (userEvent) {
                setUserEvent(JSON.parse(userEvent.content))
            }
        })()
    }, [pubkey]);

    console.log({userProfile})

    return (
        <a href="#" className="group block flex-shrink-0">
            <div className="flex items-center">
                <div>
                    {userProfile?.image ? (
                        <img
                            className="inline-block h-9 w-9 rounded-lg object-cover"
                            src={userProfile.image}
                            alt="avatar"
                        />
                    ) : (
                        <span className="inline-block h-9 w-9 overflow-hidden rounded-lg bg-slate-100">
                            <svg className="h-full w-full text-gray-300" fill="currentColor" viewBox="0 0 24 24">
                                <path
                                    d="M24 20.993V24H0v-2.996A14.977 14.977 0 0112.004 15c4.904 0 9.26 2.354 11.996 5.993zM16.002 8.999a4 4 0 11-8 0 4 4 0 018 0z"/>
                            </svg>
                        </span>
                    )}

                </div>
                <div className="ml-3">
                    <p className="text-sm font-medium text-slate-700 group-hover:text-slate-900">
                        {userProfile?.displayName ?? userProfile?.name}
                    </p>

                    {userProfile?.nip05 && (
                        <p className="text-xs font-medium text-slate-500 group-hover:text-slate-700">
                            {userProfile?.nip05}
                        </p>
                    )}
                </div>
            </div>
        </a>
    )
}

export default EventOwner
