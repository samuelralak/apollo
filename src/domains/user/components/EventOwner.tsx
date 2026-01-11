import {NDKUserProfile} from "@nostr-dev-kit/ndk";
import {useContext} from "react";
import {useAsyncAbortable, useMountEffect, useUpdateEffect} from "@react-hookz/web";
import {NDKContext} from "../../../lib/ndk/NDKProvider";
import {classNames} from "../../../utils";
import {Link} from "react-router";
import {HugeiconsIcon} from "@hugeicons/react";
import {UserCircleIcon} from "@hugeicons-pro/core-twotone-rounded";

/**
 * Safely parse profile JSON - handles malformed content from some Nostr users
 */
const parseProfile = (content: string): NDKUserProfile | null => {
    try {
        return JSON.parse(content) as NDKUserProfile;
    } catch {
        // Some profiles have invalid JSON - return null to show fallback UI
        return null;
    }
};

/**
 * Safely get string value - some profiles have objects instead of strings
 */
const safeString = (value: unknown): string | undefined => {
    if (typeof value === 'string') return value;
    if (value === null || value === undefined) return undefined;
    // If it's an object or other type, ignore it
    return undefined;
};

const EventOwner = ({pubkey, mini, hideAvatar, inline}: { pubkey: string, mini?: boolean, hideAvatar?: boolean, inline?: boolean }) => {
    const {ndkInstance} = useContext(NDKContext) as NDKContext

    const [state, actions] = useAsyncAbortable(async (_signal, key: string) => {
        const event = await ndkInstance().fetchEvent({kinds: [0], authors: [key]})
        return event ? parseProfile(event.content) : null
    })

    useMountEffect(() => { actions.execute(pubkey) })
    useUpdateEffect(() => { actions.execute(pubkey) }, [pubkey])

    const userProfile = state.result;

    // Safely extract string fields - some profiles have objects instead of strings
    const displayName = safeString(userProfile?.displayName)
        ?? safeString(userProfile?.display_name)
        ?? safeString(userProfile?.name)
        ?? pubkey.substring(0, 12) + '...';
    const nip05 = safeString(userProfile?.nip05);
    const avatarUrl = safeString(userProfile?.image) ?? safeString(userProfile?.picture);

    return (
        <Link to={`/user/${pubkey}`} className={classNames(inline ? 'inline' : 'block', 'group flex-shrink-0')}>
            <span className={classNames(inline ? 'inline-flex' : 'flex', 'items-center space-x-3')}>
                {!hideAvatar && (
                    <div>
                        {avatarUrl ? (
                            <img
                                className={classNames(mini ? 'h-5 w-5 rounded' : 'h-9 w-9 rounded-lg', 'inline-block object-cover')}
                                src={avatarUrl}
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
                        {displayName}
                    </p>

                    {(nip05 && !mini) && (
                        <p className="text-xs font-medium text-slate-500 dark:text-slate-400 group-hover:text-slate-700 dark:group-hover:text-slate-300">
                            {nip05}
                        </p>
                    )}
                </div>
            </span>
        </Link>
    )
}

export default EventOwner
