import { Link } from "react-router";
import { HugeiconsIcon } from "@hugeicons/react";
import { UserIcon } from "@hugeicons-pro/core-solid-rounded";
import { useContext, useState, useCallback } from "react";
import { NDKUserProfile } from "@nostr-dev-kit/ndk";
import { useMountEffect } from "@react-hookz/web";
import { NDKContext } from "../../../lib/ndk/NDKProvider";

interface MentionedUsersProps {
    pubkeys: string[];
}

const MentionedUsers = ({ pubkeys }: MentionedUsersProps) => {
    const { ndkInstance } = useContext(NDKContext) as NDKContext;
    const [profiles, setProfiles] = useState<Record<string, NDKUserProfile | null>>({});

    const fetchProfiles = useCallback(async () => {
        const ndk = ndkInstance();
        const results: Record<string, NDKUserProfile | null> = {};

        await Promise.all(
            pubkeys.map(async (pubkey) => {
                try {
                    const event = await ndk.fetchEvent({ kinds: [0], authors: [pubkey] });
                    results[pubkey] = event ? JSON.parse(event.content) as NDKUserProfile : null;
                } catch {
                    results[pubkey] = null;
                }
            })
        );

        setProfiles(results);
    }, [ndkInstance, pubkeys]);

    useMountEffect(() => {
        if (pubkeys.length > 0) {
            fetchProfiles();
        }
    });

    if (pubkeys.length === 0) return null;

    return (
        <div className="mt-3 flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
            <span>Mentioned:</span>
            <div className="flex items-center gap-1.5 flex-wrap">
                {pubkeys.map((pubkey) => {
                    const profile = profiles[pubkey];
                    const displayName = profile?.displayName || profile?.display_name || profile?.name || `${pubkey.slice(0, 8)}...`;
                    const image = profile?.image || profile?.picture;

                    return (
                        <Link
                            key={pubkey}
                            to={`/user/${pubkey}`}
                            className="inline-flex items-center gap-1 rounded-full bg-slate-100 dark:bg-slate-800 pl-0.5 pr-2 py-0.5 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                        >
                            <div className="h-4 w-4 rounded-full overflow-hidden bg-slate-200 dark:bg-slate-700 flex-shrink-0">
                                {image ? (
                                    <img
                                        src={image}
                                        alt=""
                                        className="h-full w-full object-cover"
                                        onError={(e) => {
                                            const target = e.target as HTMLImageElement;
                                            target.style.display = 'none';
                                        }}
                                    />
                                ) : (
                                    <div className="h-full w-full flex items-center justify-center">
                                        <HugeiconsIcon icon={UserIcon} size={10} className="text-slate-400 dark:text-slate-500" />
                                    </div>
                                )}
                            </div>
                            <span className="text-slate-600 dark:text-slate-300 truncate max-w-[100px]">
                                {displayName}
                            </span>
                        </Link>
                    );
                })}
            </div>
        </div>
    );
};

export default MentionedUsers;
