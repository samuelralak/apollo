import { Link } from "react-router";
import { HugeiconsIcon } from "@hugeicons/react";
import {
    MessageAdd01Icon,
    CheckmarkCircle02Icon,
    ThumbsUpIcon,
    ThumbsDownIcon,
    UserAdd01Icon,
    FlashIcon
} from "@hugeicons-pro/core-duotone-rounded";
import { AtIcon } from "@hugeicons-pro/core-twotone-rounded";
import type { Notification } from "../types/notification.types";
import { NotificationType } from "../types/notification.types";
import { formatDateTime } from "../../../utils";
import EventOwner from "../../user/components/EventOwner";

interface NotificationItemProps {
    notification: Notification;
    /** Whether notification is unread */
    isUnread: boolean;
    /** Compact mode for dropdown */
    compact?: boolean;
    /** Optional click handler */
    onClick?: () => void;
}

/**
 * Get icon and color for notification type
 */
const getNotificationStyle = (type: NotificationType) => {
    switch (type) {
        case NotificationType.ANSWER:
            return {
                icon: MessageAdd01Icon,
                color: "text-blue-500 dark:text-blue-400",
                bgColor: "bg-blue-50 dark:bg-blue-900/20"
            };
        case NotificationType.COMMENT:
            return {
                icon: MessageAdd01Icon,
                color: "text-slate-500 dark:text-slate-400",
                bgColor: "bg-slate-100 dark:bg-slate-700/50"
            };
        case NotificationType.ACCEPTED_ANSWER:
            return {
                icon: CheckmarkCircle02Icon,
                color: "text-green-500 dark:text-green-400",
                bgColor: "bg-green-50 dark:bg-green-900/20"
            };
        case NotificationType.MENTION:
            return {
                icon: AtIcon,
                color: "text-purple-500 dark:text-purple-400",
                bgColor: "bg-purple-50 dark:bg-purple-900/20"
            };
        case NotificationType.UPVOTE:
            return {
                icon: ThumbsUpIcon,
                color: "text-teal-500 dark:text-teal-400",
                bgColor: "bg-teal-50 dark:bg-teal-900/20"
            };
        case NotificationType.DOWNVOTE:
            return {
                icon: ThumbsDownIcon,
                color: "text-red-500 dark:text-red-400",
                bgColor: "bg-red-50 dark:bg-red-900/20"
            };
        case NotificationType.FOLLOW:
            return {
                icon: UserAdd01Icon,
                color: "text-indigo-500 dark:text-indigo-400",
                bgColor: "bg-indigo-50 dark:bg-indigo-900/20"
            };
        case NotificationType.ZAP:
            return {
                icon: FlashIcon,
                color: "text-amber-500 dark:text-amber-400",
                bgColor: "bg-amber-50 dark:bg-amber-900/20"
            };
        default:
            return {
                icon: MessageAdd01Icon,
                color: "text-slate-500 dark:text-slate-400",
                bgColor: "bg-slate-100 dark:bg-slate-700/50"
            };
    }
};

/**
 * Get action text for notification type
 */
const getActionText = (type: NotificationType, zapAmount?: number): string => {
    switch (type) {
        case NotificationType.ANSWER:
            return "answered your question";
        case NotificationType.COMMENT:
            return "commented on your answer";
        case NotificationType.ACCEPTED_ANSWER:
            return "accepted your answer";
        case NotificationType.MENTION:
            return "mentioned you";
        case NotificationType.UPVOTE:
            return "upvoted your post";
        case NotificationType.DOWNVOTE:
            return "downvoted your post";
        case NotificationType.FOLLOW:
            return "started following you";
        case NotificationType.ZAP:
            return zapAmount
                ? `zapped you ${zapAmount.toLocaleString()} sats`
                : "zapped your post";
        default:
            return "interacted with your post";
    }
};

/**
 * Build link for notification
 */
const getNotificationLink = (notification: Notification): string => {
    const { type, source, isQARelated } = notification;

    // Follow notifications link to the follower's profile
    if (type === NotificationType.FOLLOW) {
        const actorPubkey = notification.actors[0]?.pubkey;
        return actorPubkey ? `/user/${actorPubkey}` : "#";
    }

    // Only link to questions page for Q&A related content
    if (isQARelated && source.resourceId) {
        return `/questions/${source.resourceId}`;
    }

    // Non-Q&A content doesn't have a link within Apollo
    return "#";
};

const NotificationItem = ({
    notification,
    isUnread,
    compact = false,
    onClick
}: NotificationItemProps) => {
    const style = getNotificationStyle(notification.type);
    const actionText = getActionText(notification.type, notification.zapAmount);
    const link = getNotificationLink(notification);
    const actor = notification.actors[0];

    return (
        <Link
            to={link}
            onClick={onClick}
            className={`block ${compact ? 'px-4 py-3' : 'px-4 py-4'} hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors ${
                isUnread ? 'bg-teal-50/50 dark:bg-teal-900/10' : ''
            }`}
        >
            <div className="flex gap-3">
                {/* Icon */}
                <div className={`flex-shrink-0 p-2 rounded-full ${style.bgColor}`}>
                    <HugeiconsIcon
                        icon={style.icon}
                        size={compact ? 16 : 18}
                        className={style.color}
                    />
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                    {/* Actor and action */}
                    <p className={`${compact ? 'text-sm' : 'text-sm'} text-slate-700 dark:text-slate-200`}>
                        {actor ? (
                            <span className="font-medium">
                                <EventOwner pubkey={actor.pubkey} mini={true} inline={true} />
                            </span>
                        ) : (
                            <span className="font-medium">Someone</span>
                        )}
                        {" "}
                        <span className="text-slate-500 dark:text-slate-400">{actionText}</span>
                    </p>

                    {/* Source preview (if available and not compact) */}
                    {!compact && notification.source.preview && (
                        <p className="mt-1 text-xs text-slate-500 dark:text-slate-400 line-clamp-1">
                            {notification.source.preview}
                        </p>
                    )}

                    {/* Timestamp and source indicator */}
                    <div className={`${compact ? 'mt-0.5' : 'mt-1'} flex items-center gap-2`}>
                        <span className="text-xs text-slate-400 dark:text-slate-500">
                            {formatDateTime(notification.createdAt)}
                        </span>
                        {!notification.isQARelated && notification.type !== NotificationType.FOLLOW && (
                            <span className="inline-flex items-center rounded px-1.5 py-0.5 text-[10px] font-medium bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400">
                                Nostr
                            </span>
                        )}
                    </div>
                </div>

                {/* Unread indicator */}
                {isUnread && (
                    <div className="flex-shrink-0 self-center">
                        <span className="block w-2 h-2 rounded-full bg-teal-500 dark:bg-teal-400" />
                    </div>
                )}
            </div>
        </Link>
    );
};

export default NotificationItem;
