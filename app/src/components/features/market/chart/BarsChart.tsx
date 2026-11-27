import { useState } from "react";
import { Line, LineChart, ReferenceLine, XAxis, YAxis } from "recharts";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import ChartState from "./ChartState";
import type { ChartPoint, ChartSession } from "@/features/market/types";
import { formatPrice } from "@/lib/formatters";
import { getChartSummary, getDisplayChartSummary } from "@/features/market/chartSummary";
import ButtonRanges from "./ButtonRanges";

type BarsChartProps = {
  points: ChartPoint[];
  symbol: string | null;
  companyName: string | null;
  loading: boolean;
  error: string | null;
  range: string;
  onRangeChange: (nextRange: string) => void;
  session: ChartSession | null; // 1D only: x-axis runs from open to close
  previousClose: number | null; // 1D only: dashed line + baseline for the change
};

export default function BarsChart({points, symbol, companyName, loading, error, range, onRangeChange, session, previousClose}: BarsChartProps) {
  const [hoveredPoint, setHoveredPoint] = useState<ChartPoint | null>(null);

  // CARDS
  if (!symbol) {
    return (
      <ChartState
        title="Price Chart"
        description="Showing price history for the selected range"
        statLabel="Symbol"
        statValue="--"
        message="Search a stock to view chart data."
      />
    );
  }

  if (loading) {
    return (
      <ChartState
        title={symbol}
        description="Showing price history for the selected range"
        statLabel="Status"
        statValue="Loading"
        message="Loading chart data..."
      />
    );
  }

  if (error) {
    return (
      <ChartState
        title={symbol}
        description="Showing price history for the selected range"
        statLabel="Status"
        statValue="Error"
        message={error}
      />
    );
  }

  if (points.length === 0) {
    return (
      <ChartState
        title={symbol}
        description="Showing price history for the selected range"
        statLabel="Points"
        statValue="0"
        message="No chart data available for this symbol."
      />
    );
  }

  // CHART DATA
  const summary = getChartSummary(points, previousClose);

  // 1D: place points by real time, so the line only covers the part of the session that has happened
  const sessionDomain: [number, number] | null = session
    ? [Date.parse(session.open), Date.parse(session.close)]
    : null;
  const chartData = points.map((point) => ({
    ...point,
    timestamp: Date.parse(point.time),
  }));
  const displaySummary = getDisplayChartSummary(summary, hoveredPoint);
  const lineColor = summary.isPositive
    ? "var(--success)"
    : summary.isNegative
      ? "var(--danger-strong)"
      : "var(--text-muted)";

  // CONFIG
  const chartConfig = {
    price: {
      label: "Price",
      color: lineColor,
    },
  } satisfies ChartConfig;

  // TEXT DESCRIPTION
  const descriptionText = `${displaySummary.isPositive ? "+" : ""}${formatPrice(displaySummary.absoluteChange,)} 
  (${displaySummary.isPositive ? "+" : ""}${displaySummary.percentChange.toFixed(2)}%)`;

  const descriptionColor = displaySummary.isPositive
    ? "text-positive"
    : displaySummary.isNegative
      ? "text-negative"
      : "text-neutral-status";

  // UI RENDER
  return (
    <Card className="chart-card">
      <CardHeader className="chart-header">
        <div className="chart-header-copy">
          <div className="flex items-start justify-between gap-4">
            {/* LEFT: symbol + company name */}
            <div className="min-w-0">
              <CardTitle className="card-title-lg">{symbol}</CardTitle>
              {companyName ? (
                <p className="caption-text mt-1 truncate">{companyName}</p>
              ) : null}
            </div>

            {/* RIGHT: latest (or hovered) price + change */}
            <div className="shrink-0 text-right">
              <p className="number-text text-lg font-semibold">
                {formatPrice(displaySummary.displayPrice)}
              </p>
              <CardDescription className={`${descriptionColor} mt-1`}>
                {descriptionText}
              </CardDescription>
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="chart-content">
        <ChartContainer
          config={chartConfig}
          className="aspect-auto h-62.5 w-full"
        >
          <LineChart
            accessibilityLayer
            data={chartData}
            margin={{ left: 12, right: 12 }}
            onMouseMove={(state) => {
              const payload = state?.activePayload?.[0]?.payload;
              if (payload) {
                setHoveredPoint({
                  time: payload.time,
                  price: payload.price,
                });
              }
            }}
            onMouseLeave={() => setHoveredPoint(null)}
          >
            {sessionDomain ? (
              <XAxis
                dataKey="timestamp"
                type="number"
                scale="time"
                domain={sessionDomain}
                allowDataOverflow
                hide
              />
            ) : (
              <XAxis dataKey="time" hide />
            )}
            <YAxis
              hide
              domain={([dataMin, dataMax]: [number, number]) => {
                // keep the previous close line inside the chart
                const low = previousClose === null ? dataMin : Math.min(dataMin, previousClose);
                const high = previousClose === null ? dataMax : Math.max(dataMax, previousClose);
                const range = high - low;
                const padding =
                  range === 0 ? low * 0.01 || 1 : range * 0.03;
                return [low - padding, high + padding];
              }}
            />
            {previousClose !== null && (
              <ReferenceLine
                y={previousClose}
                stroke="var(--text-muted)"
                strokeDasharray="4 4"
                strokeOpacity={0.6}
              />
            )}
            <ChartTooltip
              content={
                <ChartTooltipContent
                  className="w-37.5"
                  nameKey="price"
                  formatter={(value) => formatPrice(Number(value))}
                  labelFormatter={(_, payload) => {
                    const time = payload?.[0]?.payload?.time;
                    if (!time) return "";
                    // 1D shows the time of day, longer ranges show the date
                    return sessionDomain
                      ? new Date(time).toLocaleTimeString("en-US", {
                          hour: "numeric",
                          minute: "2-digit",
                        })
                      : new Date(time).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        });
                  }}
                />
              }
            />
            <Line
              dataKey="price"
              type="monotone"
              stroke={lineColor}
              strokeWidth={2}
              dot={false}
            />
          </LineChart>
        </ChartContainer>
        <div className="chart-range-footer">
          <ButtonRanges value={range} onChange={onRangeChange} />
        </div>
      </CardContent>
    </Card>
  );
}
