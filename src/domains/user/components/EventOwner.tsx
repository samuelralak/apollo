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

const EventOwner = ({pubkey, mini, hideAvatar, inline, disableLink}: { pubkey: string, mini?: boolean, hideAvatar?: boolean, inline?: boolean, disableLink?: boolean }) => {
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

    // Use div for block layout (default), span for inline layout
    const Wrapper = inline ? 'span' : 'div';

    const content = (
        <Wrapper className={classNames(inline ? 'inline-flex' : 'flex min-w-0', 'items-center', inline ? 'gap-1.5' : 'gap-3')}>
            {!hideAvatar && (
                <Wrapper className="flex-shrink-0">
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
                </Wrapper>
            )}

            <Wrapper className={classNames(inline ? 'inline-block max-w-[150px] align-middle overflow-hidden' : 'w-0 min-w-0 flex-1 overflow-hidden')}>
                <Wrapper className={classNames(hideAvatar ? 'text-xs font-bold' : 'text-sm font-semibold', 'block text-slate-600 dark:text-slate-300 group-hover:text-slate-900 dark:group-hover:text-slate-100 truncate')}>
                    {displayName}
                </Wrapper>

                {(nip05 && !mini) && (
                    <Wrapper className="block text-xs font-medium text-slate-500 dark:text-slate-400 group-hover:text-slate-700 dark:group-hover:text-slate-300 truncate">
                        {nip05}
                    </Wrapper>
                )}
            </Wrapper>
        </Wrapper>
    );

    if (disableLink) {
        return <Wrapper className={classNames(inline ? 'inline flex-shrink-0' : 'block min-w-0')}>{content}</Wrapper>;
    }

    return (
        <Link to={`/user/${pubkey}`} className={classNames(inline ? 'inline flex-shrink-0' : 'block min-w-0', 'group')}>
            {content}
        </Link>
    )
}

export default EventOwner
