import {NDKUserProfile} from "@nostr-dev-kit/ndk";
import {useContext} from "react";
import {useAsyncAbortable, useMountEffect, useUpdateEffect} from "@react-hookz/web";
import {NDKContext} from "../../../lib/ndk/NDKProvider";
import {classNames} from "../../../utils";
import {Link} from "react-router";
import {HugeiconsIcon} from "@hugeicons/react";
import {UserCircleIcon} from "@hugeicons-pro/core-twotone-rounded";

const EventOwner = ({pubkey, mini, hideAvatar, inline}: { pubkey: string, mini?: boolean, hideAvatar?: boolean, inline?: boolean }) => {
    const {ndkInstance} = useContext(NDKContext) as NDKContext

    const [state, actions] = useAsyncAbortable(async (_signal, key: string) => {
        const event = await ndkInstance().fetchEvent({kinds: [0], authors: [key]})
        return event ? JSON.parse(event.content) as NDKUserProfile : null
    })

    useMountEffect(() => { actions.execute(pubkey) })
    useUpdateEffect(() => { actions.execute(pubkey) }, [pubkey])

    const userProfile = state.result;

    return (
        <Link to={`/user/${pubkey}`} className={classNames(inline ? 'inline' : 'block', 'group flex-shrink-0')}>
            <span className={classNames(inline ? 'inline-flex' : 'flex', 'items-center space-x-3')}>
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
                                className={classNames(mini ? 'h-5 w-5 rounded' : 'h-9 w-9 rounded-lg', 'inline-flex items-center justify-center overflow-hidden bg-slate-100 dark:bg-slate-700')}
                            >
                                <HugeiconsIcon icon={UserCircleIcon} className="h-full w-full text-slate-300 dark:text-slate-500" size={mini ? 20 : 36} />
                            </span>
                        )}
                    </div>
                )}

                <div>
                    <p className={classNames(hideAvatar ? 'text-xs font-bold' : 'text-sm font-semibold', 'text-slate-600 dark:text-slate-300 group-hover:text-slate-900 dark:group-hover:text-slate-100 truncate max-w-36 sm:max-w-none ')}>
                        {userProfile?.displayName ?? userProfile?.display_name ?? userProfile?.name ?? pubkey}
                    </p>

                    {(userProfile?.nip05 && !mini) && (
                        <p className="text-xs font-medium text-slate-500 dark:text-slate-400 group-hover:text-slate-700 dark:group-hover:text-slate-300">
                            {userProfile?.nip05}
                        </p>
                    )}
                </div>
            </span>
        </Link>
    )
}

export default EventOwner
