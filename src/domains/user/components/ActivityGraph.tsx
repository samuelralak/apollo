import {useMemo} from "react";
import type {UserActivity, ActivityDay} from "../types/profile.types";

interface ActivityGraphProps {
    activity: UserActivity;
    loading?: boolean;
}

// Color scale for light/dark modes (teal-based to match brand)
const LEVEL_COLORS = {
    light: ['#f1f5f9', '#ccfbf1', '#5eead4', '#2dd4bf', '#14b8a6'],
    dark: ['#1e293b', '#134e4a', '#0f766e', '#0d9488', '#14b8a6']
};

interface WeekData {
    days: (ActivityDay | null)[];
}

/**
 * Generates 52 weeks of data for the heatmap, filling in missing days.
 */
const generateWeeksData = (activityDays: ActivityDay[]): WeekData[] => {
    const dayMap = new Map(activityDays.map(d => [d.date, d]));
    const weeks: WeekData[] = [];
    const today = new Date();
    const oneYearAgo = new Date(today);
    oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);

    // Start from the first Sunday on or before one year ago
    const startDate = new Date(oneYearAgo);
    startDate.setDate(startDate.getDate() - startDate.getDay());

    const currentDate = new Date(startDate);
    let currentWeek: (ActivityDay | null)[] = [];

    while (currentDate <= today) {
        const dateStr = currentDate.toISOString().split('T')[0];
        const activity = dayMap.get(dateStr);

        currentWeek.push(activity ?? {
            date: dateStr,
            count: 0,
            level: 0
        });

        // If we've completed a week (Saturday), start a new one
        if (currentDate.getDay() === 6) {
            weeks.push({days: currentWeek});
            currentWeek = [];
        }

        currentDate.setDate(currentDate.getDate() + 1);
    }

    // Add any remaining days as the final partial week
    if (currentWeek.length > 0) {
        weeks.push({days: currentWeek});
    }

    return weeks;
};

const ActivityGraphSkeleton = () => (
    <div className="bg-white dark:bg-slate-800 rounded-lg p-4 border border-slate-200 dark:border-slate-700 my-6 animate-pulse">
        <div className="h-5 w-48 bg-slate-200 dark:bg-slate-700 rounded mb-4" />
        <div className="h-24 w-full bg-slate-200 dark:bg-slate-700 rounded" />
    </div>
);

const ActivityGraph = ({activity, loading}: ActivityGraphProps) => {
    const weeks = useMemo(() => generateWeeksData(activity.days), [activity.days]);

    if (loading) {
        return <ActivityGraphSkeleton />;
    }

    return (
        <div className="bg-white dark:bg-slate-800 rounded-lg p-4 border border-slate-200 dark:border-slate-700 my-6">
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-medium text-slate-700 dark:text-slate-300">
                    {activity.totalContributions} contribution{activity.totalContributions !== 1 ? 's' : ''} in the last year
                </h3>
            </div>

            <div className="overflow-x-auto">
                <div className="flex gap-[3px] min-w-fit">
                    {weeks.map((week, weekIndex) => (
                        <div key={weekIndex} className="flex flex-col gap-[3px]">
                            {week.days.map((day, dayIndex) => (
                                <div
                                    key={`${weekIndex}-${dayIndex}`}
                                    className="w-[10px] h-[10px] sm:w-3 sm:h-3 rounded-sm transition-colors"
                                    style={{
                                        backgroundColor: day
                                            ? `var(--activity-level-${day.level})`
                                            : 'var(--activity-level-0)'
                                    }}
                                    title={day ? `${day.date}: ${day.count} contribution${day.count !== 1 ? 's' : ''}` : ''}
                                />
                            ))}
                        </div>
                    ))}
                </div>
            </div>

            {/* Legend */}
            <div className="flex items-center justify-end gap-1 mt-3 text-xs text-slate-500 dark:text-slate-400">
                <span className="mr-1">Less</span>
                {[0, 1, 2, 3, 4].map(level => (
                    <div
                        key={level}
                        className="w-[10px] h-[10px] sm:w-3 sm:h-3 rounded-sm"
                        style={{backgroundColor: `var(--activity-level-${level})`}}
                    />
                ))}
                <span className="ml-1">More</span>
            </div>

            {/* CSS custom properties for colors - using inline style for theme support */}
            <style>{`
                :root {
                    --activity-level-0: ${LEVEL_COLORS.light[0]};
                    --activity-level-1: ${LEVEL_COLORS.light[1]};
                    --activity-level-2: ${LEVEL_COLORS.light[2]};
                    --activity-level-3: ${LEVEL_COLORS.light[3]};
                    --activity-level-4: ${LEVEL_COLORS.light[4]};
                }
                .dark {
                    --activity-level-0: ${LEVEL_COLORS.dark[0]};
                    --activity-level-1: ${LEVEL_COLORS.dark[1]};
                    --activity-level-2: ${LEVEL_COLORS.dark[2]};
                    --activity-level-3: ${LEVEL_COLORS.dark[3]};
                    --activity-level-4: ${LEVEL_COLORS.dark[4]};
                }
            `}</style>
        </div>
    );
};

export default ActivityGraph;
