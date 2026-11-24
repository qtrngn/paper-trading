import { Area, AreaChart, XAxis, YAxis } from 'recharts';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from '@/components/ui/chart';
import { usePortfolioHistory } from '@/hooks/usePortfolioHistory';
import { getChartSummary } from '@/features/market/chartSummary';
import type { ChartPoint } from '@/features/market/types';
import { formatPrice } from '@/lib/formatters';

function formatDate(timestamp: string) {
  return new Date(timestamp).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

export default function PortfolioHistoryChart() {
  const { historyPoints, historyLoading, historyError } = usePortfolioHistory();

  if (historyLoading) {
    return <div className="portfolio-history-placeholder body-text-sm">Loading history...</div>;
  }

  if (historyError) {
    return <div className="portfolio-history-placeholder body-text-sm text-negative">{historyError}</div>;
  }

  // Only points with a known equity can be drawn. Same shape as the stock chart,
  // so the shared chart summary logic can be reused.
  const points: ChartPoint[] = historyPoints.flatMap((point) =>
    point.equity === null ? [] : [{ time: point.timestamp, price: point.equity }],
  );

  if (points.length < 2) {
    return (
      <div className="portfolio-history-placeholder">
        <div className="space-y-2">
          <p className="card-title">Portfolio history</p>
          <p className="body-text-sm">
            Your account value is saved after each market close. The chart
            appears once there are at least two days of history.
          </p>
        </div>
      </div>
    );
  }

  // CHANGE SINCE FIRST SNAPSHOT
  const summary = getChartSummary(points);
  const sign = summary.isPositive ? '+' : '';
  const changeText = `${sign}${formatPrice(summary.absoluteChange)} (${sign}${summary.percentChange.toFixed(2)}%)`;
  const changeColor = summary.isPositive
    ? 'text-positive'
    : summary.isNegative
      ? 'text-negative'
      : 'text-neutral-status';
  const lineColor = summary.isPositive
    ? 'var(--success)'
    : summary.isNegative
      ? 'var(--danger-strong)'
      : 'var(--text-muted)';

  const chartConfig = {
    price: {
      label: 'Account value',
      color: lineColor,
    },
  } satisfies ChartConfig;

  return (
    <div className="mt-2">
      {/* HEADER */}
      <p className="text-sm">
        <span className={`number-text font-semibold ${changeColor}`}>{changeText}</span>
        <span className="caption-text"> since {formatDate(summary.firstPoint.time)}</span>
      </p>

      {/* CHART */}
      <ChartContainer config={chartConfig} className="mt-6 aspect-auto h-72 w-full">
        <AreaChart accessibilityLayer data={points} margin={{ left: 0, right: 0 }}>
          <defs>
            <linearGradient id="portfolioHistoryFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={lineColor} stopOpacity={0.25} />
              <stop offset="100%" stopColor={lineColor} stopOpacity={0} />
            </linearGradient>
          </defs>
          <XAxis dataKey="time" hide />
          <YAxis
            hide
            domain={([dataMin, dataMax]: [number, number]) => {
              const range = dataMax - dataMin;
              const padding = range === 0 ? dataMin * 0.01 || 1 : range * 0.03;
              return [dataMin - padding, dataMax + padding];
            }}
          />
          <ChartTooltip
            content={
              <ChartTooltipContent
                className="w-40"
                nameKey="price"
                formatter={(value) => formatPrice(Number(value))}
                labelFormatter={(_, payload) => {
                  const time = payload?.[0]?.payload?.time;
                  return time ? formatDate(time) : '';
                }}
              />
            }
          />
          <Area
            dataKey="price"
            type="monotone"
            stroke={lineColor}
            strokeWidth={2}
            fill="url(#portfolioHistoryFill)"
            dot={false}
          />
        </AreaChart>
      </ChartContainer>
    </div>
  );
}
