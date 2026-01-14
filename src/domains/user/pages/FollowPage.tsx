import { useParams, useLocation, Link } from "react-router";
import { useContext, useState } from "react";
import { useAsyncAbortable, useMountEffect, useUpdateEffect } from "@react-hookz/web";
import { NDKContext } from "../../../lib/ndk/NDKProvider";
import { HugeiconsIcon } from "@hugeicons/react";
import { ArrowLeft01Icon, UserCircleIcon } from "@hugeicons-pro/core-duotone-rounded";
import { classNames, getDisplayName } from "../../../utils";
import { FollowersList, FollowingList } from "../../follow/components";
import { useUserFollowers, useUserFollowing } from "../../follow/hooks";

type TabId = 'followers' | 'following';

const FollowPage = () => {
    const { pubkey } = useParams();
    const location = useLocation();

    // Determine initial tab from URL path
    const initialTab: TabId = location.pathname.endsWith('/following') ? 'following' : 'followers';
    const [activeTab, setActiveTab] = useState<TabId>(initialTab);

    const { ndkInstance } = useContext(NDKContext) as NDKContext;

    // Fetch user profile
    const [state, actions] = useAsyncAbortable(async (_signal, key: string) => {
        const user = ndkInstance().getUser({ pubkey: key });
        await user.fetchProfile();
        return user.profile;
    });

    useMountEffect(() => {
        if (pubkey) actions.execute(pubkey);
    });

    useUpdateEffect(() => {
        if (pubkey) {
            actions.reset();
            actions.execute(pubkey);
        }
    }, [pubkey]);

    // Update tab when URL changes
    useUpdateEffect(() => {
        const newTab: TabId = location.pathname.endsWith('/following') ? 'following' : 'followers';
        setActiveTab(newTab);
    }, [location.pathname]);

    // Fetch followers and following data
    const { followersPubkeys, count: followersCount, loading: followersLoading, initialized: followersInitialized } = useUserFollowers(pubkey);
    const { followingPubkeys, count: followingCount, loading: followingLoading, initialized: followingInitialized } = useUserFollowing(pubkey);

    if (!pubkey) {
        return <div className="p-8 text-center text-slate-500">Invalid User ID</div>;
    }

    const profile = state.result;
    const fetchingProfile = state.status === 'loading' || state.status === 'not-executed';
    const displayName = getDisplayName(profile, pubkey);

    const tabs = [
        { id: 'followers' as TabId, name: 'Followers', count: followersCount },
        { id: 'following' as TabId, name: 'Following', count: followingCount },
    ];

    return (
        <div className="space-y-4 overflow-hidden">
            {/* Header with back button and user info */}
            <div className="flex items-center gap-3 min-w-0">
                <Link
                    to={`/user/${pubkey}`}
                    className="flex-shrink-0 p-2 -ml-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                >
                    <HugeiconsIcon icon={ArrowLeft01Icon} size={20} className="text-slate-600 dark:text-slate-400" />
                </Link>

                <div className="flex items-center gap-3 min-w-0 flex-1">
                    {fetchingProfile ? (
                        <div className="animate-pulse flex items-center gap-3">
                            <div className="h-10 w-10 bg-slate-200 dark:bg-slate-700 rounded-lg flex-shrink-0" />
                            <div className="h-5 w-32 bg-slate-200 dark:bg-slate-700 rounded" />
                        </div>
                    ) : (
                        <>
                            {profile?.image || profile?.picture ? (
                                <img
                                    className="h-10 w-10 rounded-lg object-cover bg-slate-100 dark:bg-slate-800 flex-shrink-0"
                                    src={profile?.image ?? profile?.picture}
                                    alt=""
                                />
                            ) : (
                                <span className="h-10 w-10 inline-flex items-center justify-center bg-slate-100 dark:bg-slate-800 rounded-lg flex-shrink-0">
                                    <HugeiconsIcon icon={UserCircleIcon} size={24} className="text-slate-400" />
                                </span>
                            )}
                            <div className="min-w-0 flex-1">
                                <h1 className="text-base sm:text-lg font-semibold text-slate-900 dark:text-slate-100 truncate">
                                    {displayName}
                                </h1>
                            </div>
                        </>
                    )}
                </div>
            </div>

            {/* Tabs */}
            <div className="border-b border-slate-200 dark:border-slate-700">
                <nav className="flex">
                    {tabs.map((tab) => (
                        <Link
                            key={tab.id}
                            to={`/user/${pubkey}/${tab.id}`}
                            className={classNames(
                                "flex-1 flex items-center justify-center gap-2 py-3 text-sm font-medium border-b-2 transition-colors",
                                tab.id === activeTab
                                    ? "border-teal-500 text-slate-900 dark:text-slate-100"
                                    : "border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300"
                            )}
                        >
                            {tab.name}
                            <span className={classNames(
                                "px-2 py-0.5 rounded-full text-xs tabular-nums",
                                tab.id === activeTab
                                    ? "bg-slate-200 dark:bg-slate-700"
                                    : "bg-slate-100 dark:bg-slate-800"
                            )}>
                                {tab.count}
                            </span>
                        </Link>
                    ))}
                </nav>
            </div>

            {/* Tab Content */}
            <div>
                {activeTab === 'followers' && (
                    <FollowersList
                        followersPubkeys={followersPubkeys}
                        loading={followersLoading}
                        initialized={followersInitialized}
                    />
                )}
                {activeTab === 'following' && (
                    <FollowingList
                        followingPubkeys={followingPubkeys}
                        loading={followingLoading}
                        initialized={followingInitialized}
                    />
                )}
            </div>
        </div>
    );
};

export default FollowPage;
