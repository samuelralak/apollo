import {NDKUserProfile} from "@nostr-dev-kit/ndk";
import {useContext, useEffect, useState} from "react";
import {NDKContext} from "../NDKProvider.tsx";
import {classNames} from "../../utils";

const EventOwner = ({pubkey, mini, hideAvatar}: { pubkey: string, mini?: boolean, hideAvatar?: boolean }) => {
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

    return (
        <a href="#" className="group block flex-shrink-0">
            <div className="flex items-center space-x-3">
                {!hideAvatar && (
                    <div>
                        {userProfile?.image || userProfile?.picture ? (
                            <img
                                className={classNames(mini ? 'h-5 w-5 rounded' : 'h-9 w-9 rounded-lg', 'inline-block object-cover')}
                                src={userProfile.image ?? userProfile.picture}
                                alt="avatar"
                            />
                        ) : (
                            <span
                                className={classNames(mini ? 'h-5 w-5 rounded' : 'h-9 w-9 rounded-lg', 'inline-block overflow-hidden bg-slate-100')}
                            >
                            <svg className="h-full w-full text-gray-300" fill="currentColor" viewBox="0 0 24 24">
                                <path
                                    d="M24 20.993V24H0v-2.996A14.977 14.977 0 0112.004 15c4.904 0 9.26 2.354 11.996 5.993zM16.002 8.999a4 4 0 11-8 0 4 4 0 018 0z"/>
                            </svg>
                        </span>
                        )}
                    </div>
                )}

                <div>
                    <p className={classNames(hideAvatar ? 'text-xs font-bold' : 'text-sm font-semibold', 'text-slate-600 group-hover:text-slate-900 truncate max-w-36 sm:max-w-none ')}>
                        {userProfile?.displayName ?? userProfile?.display_name ?? userProfile?.name ?? pubkey}
                    </p>

                    {(userProfile?.nip05 && !mini) && (
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
