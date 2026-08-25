import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';

type ChartData = {
  date: string;
  count: number;
};

type TooltipProps = {
  active: boolean;
  payload: any;
  label?: string | number | undefined;
};

const CustomTooltip = ({ active, payload, label }: TooltipProps) => {
  if (!active || payload.length === 0) {
    return null;
  }

  const date = label != null ? String(label) : '';
  const count = payload[0].value;

  return (
    <div className="px-3 py-2 bg-white text-sm text-muted-foreground border border-muted/40 shadow-md">
      <p className="mb-1">{date}</p>
      <p className="mb-0 font-medium">count: {count}</p>
    </div>
  );
};

export const PageViewsChart = ({ data }: { data: ChartData[] }) => {
  if (!data || data.length === 0) {
    return null; // Let the parent handle empty state
  }

  // Determine tick density: show every tick if <= 20 points, else every 2nd point
  const shouldShowTick = (index: number) => {
    if (data.length <= 20) {
      return true;
    }

    return index % 2 === 0;
  };

  return (
    <ResponsiveContainer width="100%" height={250}>
      <LineChart
        data={data}
        margin={{ top: 20, right: 30, left: 0, bottom: 5 }}
      >
        <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.5} />
        <XAxis
          dataKey="date"
          tick={(props: any) => {
            const { payload, index, x, y } = props;

            if (!shouldShowTick(index)) {
              return null;
            }

            return <text x={x} y={y}>{payload.value}</text>;
          }}
          tickMargin={10}
        />
        <YAxis
          tickFormatter={(value) => `${Math.floor(value)}`}
          tickMargin={10}
          domain={['auto', 'auto']}
        />
        <Tooltip
          content={CustomTooltip}
          labelFormatter={(label) => label} // label is the date from XAxis
          formatter={(value) => `${value}`}
        />
        <Line
          type="monotone"
          dataKey="count"
          stroke="var(--color-page-view-line)"
          strokeWidth={2}
          dot={{ stroke: '#ffffff', strokeWidth: 2, r: 4 }} // White dot with stroke to stand out
          activeDot={{ r: 6 }}
          isAnimationActive={false}
        />
      </LineChart>
    </ResponsiveContainer>
  );
};