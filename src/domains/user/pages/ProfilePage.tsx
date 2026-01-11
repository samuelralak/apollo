import {useParams} from "react-router";
import {useContext, useState, useMemo} from "react";
import {useAsyncAbortable, useMountEffect, useUpdateEffect} from "@react-hookz/web";
import type {Question} from "../../question/types/question.types";
import type {Answer} from "../../answer/types/answer.types";
import {NDKContext} from "../../../lib/ndk/NDKProvider";
import Loader from "../../../shared/components/feedback/Loader";
import {classNames} from "../../../utils";
import BannerPlaceholder from '../../../assets/banner-placeholder.png';
import {HugeiconsIcon} from "@hugeicons/react";
import {
    UserCircleIcon,
    Link01Icon,
    BitcoinEllipseIcon,
    CheckmarkBadge01Icon
} from "@hugeicons-pro/core-twotone-rounded";
import {
    HelpCircleIcon,
    MessageDone01Icon
} from "@hugeicons-pro/core-duotone-rounded";
import ActivityGraph from "../components/ActivityGraph";
import UserQuestionsList from "../components/UserQuestionsList";
import UserAnswersList from "../components/UserAnswersList";
import useUserStats from "../hooks/useUserStats";
import useUserActivity from "../hooks/useUserActivity";
import {FollowButton, FollowersList, FollowingList} from "../../follow/components";
import {useUserFollowers, useUserFollowing} from "../../follow/hooks";
import type {NDKUserProfile} from "@nostr-dev-kit/ndk";
import type {UserStats} from "../types/profile.types";
import type {UserActivity} from "../types/profile.types";

type TabId = 'overview' | 'questions' | 'answers' | 'followers' | 'following';

// TODO: Move formatTimeAgo to src/utils/date.utils.ts for reuse across components
const formatTimeAgo = (timestamp: number): string => {
    const seconds = Math.floor(Date.now() / 1000) - timestamp;
    if (seconds < 60) return 'just now';
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    if (days < 7) return `${days}d ago`;
    const weeks = Math.floor(days / 7);
    if (weeks < 4) return `${weeks}w ago`;
    const months = Math.floor(days / 30);
    if (months < 12) return `${months}mo ago`;
    const years = Math.floor(days / 365);
    return `${years}y ago`;
};

const ProfilePage = () => {
    const {pubkey} = useParams();
    const {ndkInstance} = useContext(NDKContext) as NDKContext;
    const [activeTab, setActiveTab] = useState<TabId>('overview');

    const [state, actions] = useAsyncAbortable(async (_signal, key: string) => {
        const user = ndkInstance().getUser({pubkey: key});
        await user.fetchProfile();
        return user.profile;
    });

    // Initial load on mount
    useMountEffect(() => {
        if (pubkey) actions.execute(pubkey);
    });

    // Re-fetch when navigating between profiles (pubkey changes)
    // Reset state first to clear stale profile data, then fetch new profile
    useUpdateEffect(() => {
        if (pubkey) {
            setActiveTab('overview');
            actions.reset();
            actions.execute(pubkey);
        }
    }, [pubkey]);

    // Safety: pass empty string if pubkey is undefined (hooks handle gracefully)
    const {questions, answers, questionVotes, answerVotes, stats, loading: statsLoading} = useUserStats(pubkey || '');
    const {activity, loading: activityLoading} = useUserActivity(pubkey || '');

    // Follower/following data - hooks must be called at page level to avoid "late joiner" issue
    // (when same filter is used in multiple hooks, later subscribers miss events)
    const {followersPubkeys, count: followersCount, loading: followersLoading, initialized: followersInitialized} = useUserFollowers(pubkey);
    const {followingPubkeys, count: followingCount, loading: followingLoading, initialized: followingInitialized} = useUserFollowing(pubkey);

    // Safety check: show error state if no pubkey
    if (!pubkey) {
        return <div className="p-8 text-center text-slate-500">Invalid User ID</div>;
    }

    const profile = state.result;
    const fetchingProfile = state.status === 'loading' || state.status === 'not-executed';

    if (fetchingProfile) {
        return <Loader loadingText={'fetching profile'}/>;
    }

    const tabs = [
        {id: 'overview' as TabId, name: 'Overview', count: null},
        {id: 'questions' as TabId, name: 'Questions', count: stats.questionsCount},
        {id: 'answers' as TabId, name: 'Answers', count: stats.answersCount},
        {id: 'followers' as TabId, name: 'Followers', count: followersCount},
        {id: 'following' as TabId, name: 'Following', count: followingCount}
    ];

    return (
        <div className="space-y-6">
            {/* Banner */}
            <img
                className="h-32 sm:h-40 lg:h-48 w-full object-cover bg-slate-100 dark:bg-slate-800 rounded-xl"
                src={profile?.banner ?? BannerPlaceholder}
                alt=""
            />

            {/* Two-column layout */}
            <div className="lg:grid lg:grid-cols-[280px_1fr] lg:gap-8 lg:mx-8">
                {/* Sidebar */}
                <ProfileSidebar
                    pubkey={pubkey}
                    profile={profile}
                    followersCount={followersCount}
                    followingCount={followingCount}
                    followLoading={followersLoading || followingLoading}
                    onTabChange={setActiveTab}
                />

                {/* Main Content */}
                <div className="mt-6 lg:mt-0">
                    {/* Tabs */}
                    <div className="border-b border-slate-200 dark:border-slate-700">
                        <nav className="flex gap-6">
                            {tabs.map((tab) => (
                                <button
                                    key={tab.id}
                                    type="button"
                                    onClick={() => setActiveTab(tab.id)}
                                    className={classNames(
                                        tab.id === activeTab
                                            ? 'border-teal-500 text-slate-900 dark:text-slate-100'
                                            : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300 hover:border-slate-300 dark:hover:border-slate-600',
                                        'flex items-center gap-2 border-b-2 pb-3 text-sm font-medium transition-colors'
                                    )}
                                >
                                    {tab.name}
                                    {tab.count !== null && (
                                        <span className={classNames(
                                            tab.id === activeTab
                                                ? 'bg-slate-200 dark:bg-slate-700'
                                                : 'bg-slate-100 dark:bg-slate-800',
                                            'px-2 py-0.5 rounded-full text-xs tabular-nums'
                                        )}>
                                            {tab.count}
                                        </span>
                                    )}
                                </button>
                            ))}
                        </nav>
                    </div>

                    {/* Tab Content */}
                    <div className="mt-4">
                        {activeTab === 'overview' && (
                            <OverviewTab
                                activity={activity}
                                questions={questions}
                                answers={answers}
                                stats={stats}
                                loading={activityLoading || statsLoading}
                            />
                        )}
                        {activeTab === 'questions' && (
                            <UserQuestionsList questions={questions} votes={questionVotes} loading={statsLoading} />
                        )}
                        {activeTab === 'answers' && (
                            <UserAnswersList answers={answers} votes={answerVotes} loading={statsLoading} />
                        )}
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
            </div>
        </div>
    );
};

/* Overview Tab */
interface OverviewTabProps {
    activity: UserActivity;
    questions: Question[];
    answers: Answer[];
    stats: UserStats;
    loading: boolean;
}

const OverviewTab = ({activity, questions, answers, stats, loading}: OverviewTabProps) => {
    // Compute top tags from questions
    const topTags = useMemo(() => {
        const tagCounts = new Map<string, number>();
        questions.forEach(q => {
            q.tags.forEach(tag => {
                tagCounts.set(tag, (tagCounts.get(tag) || 0) + 1);
            });
        });
        return Array.from(tagCounts.entries())
            .sort((a, b) => b[1] - a[1])
            .slice(0, 6);
    }, [questions]);

    // Compute recent activity (last 5 items)
    const recentActivity = useMemo(() => {
        const items: Array<{type: 'question' | 'answer'; title: string; id: string; createdAt: number}> = [
            ...questions.map(q => ({
                type: 'question' as const,
                title: q.title,
                id: q.id,
                createdAt: q.createdAt || 0
            })),
            ...answers.map(a => ({
                type: 'answer' as const,
                title: 'Answered a question',
                id: a.questionId,
                createdAt: a.createdAt
            }))
        ];
        return items.sort((a, b) => b.createdAt - a.createdAt).slice(0, 5);
    }, [questions, answers]);

    if (loading) {
        return <OverviewSkeleton />;
    }

    return (
        <div className="space-y-8">
            {/* Activity Graph */}
            <ActivityGraph activity={activity} loading={false} />

            {/* Two column layout: Timeline + Sidebar */}
            <div className="grid grid-cols-1 lg:grid-cols-[1fr_280px] gap-8">
                {/* Activity Timeline */}
                <div>
                    <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100 mb-4">
                        Recent Activity
                    </h3>
                    {recentActivity.length > 0 ? (
                        <div className="relative pl-8">
                            {/* Timeline line */}
                            <div className="absolute left-[11px] top-1 bottom-1 w-px bg-slate-200 dark:bg-slate-700" />

                            <ul className="space-y-5">
                                {recentActivity.map((item) => (
                                    <li key={`${item.type}-${item.id}`} className="relative">
                                        {/* Timeline icon */}
                                        <div className="absolute -left-8 top-0 w-6 h-6 rounded-full flex items-center justify-center bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700">
                                            <HugeiconsIcon
                                                icon={item.type === 'question' ? HelpCircleIcon : MessageDone01Icon}
                                                size={14}
                                                className="text-slate-400 dark:text-slate-500"
                                            />
                                        </div>

                                        <div className="flex items-baseline justify-between gap-4">
                                            <p className="text-sm leading-snug">
                                                <span className="text-slate-500 dark:text-slate-400">
                                                    {item.type === 'question' ? 'Asked' : 'Answered'}
                                                </span>
                                                {' '}
                                                <span className="text-slate-900 dark:text-slate-100 line-clamp-1">{item.title}</span>
                                            </p>
                                            <span className="text-xs text-slate-400 dark:text-slate-500 whitespace-nowrap">
                                                {formatTimeAgo(item.createdAt)}
                                            </span>
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    ) : (
                        <p className="text-sm text-slate-500 dark:text-slate-400">No recent activity</p>
                    )}
                </div>

                {/* Sidebar: Tags + Engagement */}
                <div className="space-y-6">
                    {/* Top Tags */}
                    <div>
                        <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100 mb-3">
                            Top Tags
                        </h3>
                        {topTags.length > 0 ? (
                            <div className="flex flex-wrap gap-2">
                                {topTags.map(([tag, count]) => (
                                    <span
                                        key={tag}
                                        className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs rounded-md bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700"
                                    >
                                        {tag}
                                        <span className="text-slate-400 dark:text-slate-500">({count})</span>
                                    </span>
                                ))}
                            </div>
                        ) : (
                            <p className="text-sm text-slate-500 dark:text-slate-400">No tags yet</p>
                        )}
                    </div>

                    {/* Engagement Stats */}
                    <div>
                        <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100 mb-3">
                            Engagement
                        </h3>
                        <dl className="space-y-3">
                            <div className="flex justify-between items-center">
                                <dt className="text-sm text-slate-600 dark:text-slate-400">Questions</dt>
                                <dd className="text-sm font-semibold text-slate-900 dark:text-slate-100">{stats.questionsCount}</dd>
                            </div>
                            <div className="flex justify-between items-center">
                                <dt className="text-sm text-slate-600 dark:text-slate-400">Answers</dt>
                                <dd className="text-sm font-semibold text-slate-900 dark:text-slate-100">{stats.answersCount}</dd>
                            </div>
                            <div className="flex justify-between items-center">
                                <dt className="text-sm text-slate-600 dark:text-slate-400">Votes received</dt>
                                <dd className="text-sm font-semibold">
                                    <span className="text-green-600 dark:text-green-400">+{stats.votesReceived.upvotes}</span>
                                    <span className="text-slate-400 dark:text-slate-500 mx-1">/</span>
                                    <span className="text-red-600 dark:text-red-400">-{stats.votesReceived.downvotes}</span>
                                </dd>
                            </div>
                            <div className="flex justify-between items-center">
                                <dt className="text-sm text-slate-600 dark:text-slate-400">Accepted</dt>
                                <dd className="text-sm font-semibold text-slate-900 dark:text-slate-100">{stats.acceptedAnswers}</dd>
                            </div>
                        </dl>
                    </div>
                </div>
            </div>
        </div>
    );
};

const OverviewSkeleton = () => (
    <div className="space-y-8 animate-pulse">
        <div className="h-32 bg-slate-200 dark:bg-slate-700 rounded-lg" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[...Array(3)].map((_, i) => (
                <div key={i}>
                    <div className="h-4 w-24 bg-slate-200 dark:bg-slate-700 rounded mb-3" />
                    <div className="space-y-2">
                        <div className="h-4 w-full bg-slate-200 dark:bg-slate-700 rounded" />
                        <div className="h-4 w-3/4 bg-slate-200 dark:bg-slate-700 rounded" />
                    </div>
                </div>
            ))}
        </div>
    </div>
);

/* Sidebar Component */
interface ProfileSidebarProps {
    pubkey: string;
    profile?: NDKUserProfile | null;
    followersCount: number;
    followingCount: number;
    followLoading: boolean;
    onTabChange: (tab: TabId) => void;
}

const ProfileSidebar = ({pubkey, profile, followersCount, followingCount, followLoading, onTabChange}: ProfileSidebarProps) => {
    const displayName = profile?.displayName ?? profile?.display_name ?? profile?.name ?? 'Anonymous';

    const getHostname = (url: string): string => {
        try {
            return new URL(url).hostname;
        } catch {
            return url;
        }
    };

    return (
        <aside className="space-y-4">
            {/* Avatar */}
            <div className="flex lg:block items-center gap-4">
                <div className="-mt-12 lg:-mt-16">
                    {profile?.image || profile?.picture ? (
                        <img
                            className="h-24 w-24 lg:h-32 lg:w-32 rounded-xl object-cover border-4 border-white dark:border-slate-900 bg-slate-100 dark:bg-slate-800"
                            src={profile?.image ?? profile?.picture}
                            alt=""
                        />
                    ) : (
                        <span className="h-24 w-24 lg:h-32 lg:w-32 inline-flex items-center justify-center overflow-hidden bg-slate-100 dark:bg-slate-800 rounded-xl border-4 border-white dark:border-slate-900">
                            <HugeiconsIcon
                                icon={UserCircleIcon}
                                className="h-full w-full text-slate-300 dark:text-slate-600"
                                size={128}
                            />
                        </span>
                    )}
                </div>

                {/* Name - shown inline on mobile */}
                <div className="lg:hidden mt-2">
                    <h1 className="text-xl font-bold text-slate-900 dark:text-slate-100">
                        {displayName}
                    </h1>
                    {profile?.nip05 && (
                        <p className="text-sm text-slate-500 dark:text-slate-400">
                            {profile.nip05}
                        </p>
                    )}
                </div>
            </div>

            {/* Name - shown below avatar on desktop */}
            <div className="hidden lg:block">
                <div className="flex items-start justify-between gap-3">
                    <div>
                        <h1 className="text-xl font-bold text-slate-900 dark:text-slate-100">
                            {displayName}
                        </h1>
                        {profile?.nip05 && (
                            <p className="text-sm text-slate-500 dark:text-slate-400">
                                {profile.nip05}
                            </p>
                        )}
                    </div>
                    <FollowButton pubkey={pubkey} size="sm" />
                </div>
            </div>

            {/* Follow button on mobile - shown inline */}
            <div className="lg:hidden">
                <FollowButton pubkey={pubkey} size="sm" />
            </div>

            {/* Bio */}
            {profile?.about && (
                <p className="text-sm text-slate-600 dark:text-slate-400 whitespace-pre-wrap break-words overflow-hidden">
                    {profile.about}
                </p>
            )}

            {/* Followers/Following */}
            <div className="flex items-center gap-5 text-sm">
                {followLoading ? (
                    <div className="flex gap-5 animate-pulse">
                        <div className="h-4 w-20 bg-slate-200 dark:bg-slate-700 rounded" />
                        <div className="h-4 w-20 bg-slate-200 dark:bg-slate-700 rounded" />
                    </div>
                ) : (
                    <>
                        <button
                            type="button"
                            onClick={() => onTabChange('followers')}
                            className="text-slate-600 dark:text-slate-400 hover:text-teal-600 dark:hover:text-teal-400 transition-colors"
                        >
                            <strong className="text-slate-900 dark:text-slate-100">{followersCount}</strong> followers
                        </button>
                        <button
                            type="button"
                            onClick={() => onTabChange('following')}
                            className="text-slate-600 dark:text-slate-400 hover:text-teal-600 dark:hover:text-teal-400 transition-colors"
                        >
                            <strong className="text-slate-900 dark:text-slate-100">{followingCount}</strong> following
                        </button>
                    </>
                )}
            </div>

            {/* Links */}
            {(profile?.website || profile?.lud16) && (
                <div className="space-y-2 pt-2 border-t border-slate-200 dark:border-slate-700">
                    {profile?.website && (
                        <a
                            href={profile.website}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400 hover:text-teal-600 dark:hover:text-teal-400 transition-colors"
                        >
                            <HugeiconsIcon icon={Link01Icon} size={16} />
                            {getHostname(profile.website)}
                        </a>
                    )}
                    {profile?.lud16 && (
                        <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                            <HugeiconsIcon icon={BitcoinEllipseIcon} size={16} className="text-amber-500" />
                            <span className="truncate">{profile.lud16}</span>
                        </div>
                    )}
                    {profile?.nip05 && (
                        <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                            <HugeiconsIcon icon={CheckmarkBadge01Icon} size={16} className="text-teal-500" />
                            <span className="truncate">{profile.nip05}</span>
                        </div>
                    )}
                </div>
            )}
        </aside>
    );
};

export default ProfilePage;
