import {
    differenceInDays,
    differenceInHours,
    differenceInMinutes,
    differenceInMonths,
    differenceInSeconds,
    differenceInYears,
    format
} from "date-fns";

export const classNames = (...classes: string[]) => {
    return classes.filter(Boolean).join(' ')
}

export const formatDateTime = (unixTimestamp: number | undefined): string => {
    if (unixTimestamp) {
        const now = new Date();
        const timestampDate = new Date(unixTimestamp * 1000);

        const diffInSeconds = differenceInSeconds(now, timestampDate);
        const diffInMinutes = differenceInMinutes(now, timestampDate);
        const diffInHours = differenceInHours(now, timestampDate);
        const diffInDays = differenceInDays(now, timestampDate);
        const diffInMonths = differenceInMonths(now, timestampDate);
        const diffInYears = differenceInYears(now, timestampDate);

        if (diffInSeconds < 60) return `${diffInSeconds} seconds ago`;
        if (diffInMinutes < 60) return `${diffInMinutes} minutes ago`;
        if (diffInHours < 24) return `${diffInHours} hours ago`;
        if (diffInDays < 3) return `${diffInDays} days ago`;
        if (diffInMonths < 11) return format(timestampDate, "d MMM, h:mm a");
        if (diffInMonths >= 11 || diffInYears >= 1)
            return `${diffInYears} years ago`;
    }

    return ""
};
