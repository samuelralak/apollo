import {useMemo} from "react";
import {
    ResponsiveContainer,
    AreaChart,
    Area,
    XAxis,
    YAxis,
    Tooltip,
    CartesianGrid
} from "recharts";
import type {UserActivity, ActivityDay} from "../types/profile.types";

interface ActivityGraphProps {
    activity: UserActivity;
    loading?: boolean;
}

interface WeeklyData {
    week: number;
    count: number;
    startDate: string;
    month: string;
}

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

/**
 * Aggregates daily activity into weekly data for the chart.
 */
const generateWeeklyData = (activityDays: ActivityDay[]): WeeklyData[] => {
    const dayMap = new Map(activityDays.map(d => [d.date, d]));
    const weeks: WeeklyData[] = [];
    const today = new Date();
    const oneYearAgo = new Date(today);
    oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);

    // Start from the first Sunday on or before one year ago
    const startDate = new Date(oneYearAgo);
    startDate.setDate(startDate.getDate() - startDate.getDay());

    const currentDate = new Date(startDate);
    let weekTotal = 0;
    let weekStart = currentDate.toISOString().split('T')[0];
    let weekIndex = 0;

    while (currentDate <= today) {
        const dateStr = currentDate.toISOString().split('T')[0];
        const activity = dayMap.get(dateStr);
        weekTotal += activity?.count ?? 0;

        // If we've completed a week (Saturday), push the data
        if (currentDate.getDay() === 6) {
            const weekStartDate = new Date(weekStart);

            weeks.push({
                week: weekIndex,
                count: weekTotal,
                startDate: weekStart,
                month: MONTHS[weekStartDate.getMonth()]
            });

            weekIndex++;
            weekTotal = 0;
            weekStart = new Date(currentDate.getTime() + 86400000).toISOString().split('T')[0];
        }

        currentDate.setDate(currentDate.getDate() + 1);
    }

    // Add any remaining days as the final partial week
    if (weekTotal > 0 || currentDate > today) {
        const weekStartDate = new Date(weekStart);
        weeks.push({
            week: weekIndex,
            count: weekTotal,
            startDate: weekStart,
            month: MONTHS[weekStartDate.getMonth()]
        });
    }

    return weeks;
};

const ActivityGraphSkeleton = () => (
    <div className="bg-white dark:bg-slate-800 rounded-lg p-4 border border-slate-200 dark:border-slate-700 animate-pulse">
        <div className="h-5 w-48 bg-slate-200 dark:bg-slate-700 rounded mb-4" />
        <div className="h-32 w-full bg-slate-200 dark:bg-slate-700 rounded" />
    </div>
);

interface CustomTooltipProps {
    active?: boolean;
    payload?: Array<{value: number; payload: WeeklyData}>;
}

const CustomTooltip = ({active, payload}: CustomTooltipProps) => {
    if (!active || !payload?.length) return null;

    const data = payload[0].payload;
    return (
        <div className="bg-slate-900 dark:bg-slate-700 text-white text-xs px-2 py-1 rounded shadow-lg">
            <p className="font-medium">{data.count} contribution{data.count !== 1 ? 's' : ''}</p>
            <p className="text-slate-400">Week of {data.startDate}</p>
        </div>
    );
};

const ActivityGraph = ({activity, loading}: ActivityGraphProps) => {
    const weeklyData = useMemo(() => generateWeeklyData(activity.days), [activity.days]);

    if (loading) {
        return <ActivityGraphSkeleton />;
    }

    return (
        <div className="bg-white dark:bg-slate-800 rounded-lg p-4 border border-slate-200 dark:border-slate-700">
            <h3 className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-4">
                {activity.totalContributions} contribution{activity.totalContributions !== 1 ? 's' : ''} in the last year
            </h3>

            <div className="h-36">
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={weeklyData} margin={{top: 8, right: 8, bottom: 4, left: 0}}>
                        <defs>
                            <linearGradient id="activityGradient" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#14b8a6" stopOpacity={0.3} />
                                <stop offset="95%" stopColor="#14b8a6" stopOpacity={0} />
                            </linearGradient>
                        </defs>
                        <CartesianGrid
                            strokeDasharray="3 3"
                            vertical={false}
                            stroke="currentColor"
                            className="text-slate-200 dark:text-slate-700"
                        />
                        <XAxis
                            dataKey="week"
                            axisLine={false}
                            tickLine={false}
                            tick={{fontSize: 11, fill: '#94a3b8'}}
                            ticks={[0, 8, 17, 26, 35, 44]}
                            tickFormatter={(weekIdx) => {
                                const data = weeklyData[weekIdx];
                                return data?.month ?? '';
                            }}
                        />
                        <YAxis
                            tick={{fontSize: 11, fill: '#94a3b8'}}
                            axisLine={false}
                            tickLine={false}
                            width={24}
                            tickFormatter={(value) => value > 0 ? value : ''}
                        />
                        <Tooltip content={<CustomTooltip />} />
                        <Area
                            type="monotone"
                            dataKey="count"
                            stroke="#14b8a6"
                            strokeWidth={1.5}
                            fill="url(#activityGradient)"
                        />
                    </AreaChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
};

export default ActivityGraph;
