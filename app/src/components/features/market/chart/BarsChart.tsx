import { useState } from "react";
import { Line, LineChart, XAxis, YAxis } from "recharts";
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
import type { ChartPoint } from "@/features/market/types";
import { formatPrice } from "@/lib/formatters";
import { getChartSummary, getDisplayChartSummary } from "@/features/market/chartSummary";
import ButtonRanges from "./ButtonRanges";

type BarsChartProps = {
  points: ChartPoint[];
  symbol: string | null;
  loading: boolean;
  error: string | null;
  range: string;
  onRangeChange: (nextRange: string) => void;
};

export default function BarsChart({points, symbol,loading, error, range, onRangeChange}: BarsChartProps) {
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
  // const chartData = getChartSummary(points);
  const summary = getChartSummary(points);
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
          <CardTitle className="card-title-lg">{symbol}</CardTitle>
          <CardDescription className={descriptionColor}>
            {descriptionText}
          </CardDescription>
        </div>
      </CardHeader>

      <CardContent className="chart-content">
        <ChartContainer
          config={chartConfig}
          className="aspect-auto h-62.5 w-full"
        >
          <LineChart
            accessibilityLayer
            data={points}
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
            <XAxis dataKey="time" hide />
            <YAxis
              hide
              domain={([dataMin, dataMax]: [number, number]) => {
                const range = dataMax - dataMin;
                const padding =
                  range === 0 ? dataMin * 0.01 || 1 : range * 0.03;
                return [dataMin - padding, dataMax + padding];
              }}
            />
            <ChartTooltip
              content={
                <ChartTooltipContent
                  className="w-37.5"
                  nameKey="price"
                  formatter={(value) => formatPrice(Number(value))}
                  labelFormatter={(value) =>
                    new Date(value).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })
                  }
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
