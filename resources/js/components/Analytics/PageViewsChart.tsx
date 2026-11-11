import { useId } from 'react';
import {
    Area,
    AreaChart,
    CartesianGrid,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis,
} from 'recharts';

type ChartData = {
    date: string;
    count: number;
};

type TooltipProps = {
    active?: boolean;
    payload?: { value: number }[];
    label?: string | number;
};

const shortDate = (value: string | number | undefined) => {
    const date = new Date(`${value}T00:00:00`);

    return Number.isNaN(date.getTime())
        ? String(value ?? '')
        : date.toLocaleDateString(undefined, {
              month: 'short',
              day: 'numeric',
          });
};

const CustomTooltip = ({ active, payload, label }: TooltipProps) => {
    if (!active || !payload?.length) {
        return null;
    }

    return (
        <div className="rounded-xl border bg-popover/90 px-3 py-2 text-xs shadow-lg backdrop-blur">
            <p className="text-muted-foreground">{shortDate(label)}</p>
            <p className="mt-1 font-semibold tabular-nums">
                {payload[0].value} views
            </p>
        </div>
    );
};

interface PageViewsChartProps {
    data: ChartData[];
    color?: string;
}

export const PageViewsChart = ({ data, color }: PageViewsChartProps) => {
    const id = useId().replace(/:/g, '');

    if (!data || data.length === 0) {
        return null; // Let the parent handle empty state
    }

    const stroke = color || 'var(--highlight)';

    return (
        <div className="px-2 pt-4 pb-2 sm:px-4">
            <ResponsiveContainer width="100%" height={260}>
                <AreaChart
                    data={data}
                    margin={{ top: 12, right: 12, left: -12, bottom: 0 }}
                >
                    <defs>
                        <linearGradient
                            id={`${id}-fill`}
                            x1="0"
                            y1="0"
                            x2="0"
                            y2="1"
                        >
                            <stop
                                offset="0%"
                                stopColor={stroke}
                                stopOpacity={0.4}
                            />
                            <stop
                                offset="100%"
                                stopColor={stroke}
                                stopOpacity={0}
                            />
                        </linearGradient>
                        <linearGradient
                            id={`${id}-line`}
                            x1="0"
                            y1="0"
                            x2="1"
                            y2="0"
                        >
                            <stop offset="0%" stopColor="var(--primary)" />
                            <stop offset="100%" stopColor={stroke} />
                        </linearGradient>
                    </defs>
                    <CartesianGrid
                        vertical={false}
                        stroke="currentColor"
                        strokeOpacity={0.08}
                        strokeDasharray="3 5"
                    />
                    <XAxis
                        dataKey="date"
                        tickFormatter={shortDate}
                        tick={{ fill: 'var(--muted-foreground)', fontSize: 11 }}
                        tickLine={false}
                        axisLine={false}
                        minTickGap={24}
                        tickMargin={10}
                    />
                    <YAxis
                        allowDecimals={false}
                        tick={{ fill: 'var(--muted-foreground)', fontSize: 11 }}
                        tickLine={false}
                        axisLine={false}
                        width={44}
                    />
                    <Tooltip
                        content={<CustomTooltip />}
                        cursor={{ stroke: 'currentColor', strokeOpacity: 0.2 }}
                    />
                    <Area
                        type="monotone"
                        dataKey="count"
                        stroke={`url(#${id}-line)`}
                        strokeWidth={3}
                        fill={`url(#${id}-fill)`}
                        dot={false}
                        activeDot={{
                            r: 6,
                            fill: stroke,
                            stroke: 'var(--card)',
                            strokeWidth: 3,
                        }}
                        className="studio-glow"
                        animationDuration={1200}
                        animationEasing="ease-in-out"
                    />
                </AreaChart>
            </ResponsiveContainer>
        </div>
    );
};
