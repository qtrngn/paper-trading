import { useState } from "react";
import { CartesianGrid, Line, LineChart, XAxis, YAxis } from "recharts";
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
import ChartState from "./chart/ChartState";

import type { Bar } from "@/features/market/types";
import { formatPrice } from "@/lib/formatters";
import { getChartSummary, getDisplayChartSummary, type HoveredChartPoint } from "@/features/market/chartSummary";
import ButtonRanges from "./chart/ButtonRanges";

type BarsChartProps = {
  bars: Bar[];
  symbol: string | null;
  loading: boolean;
  error: string | null;
  range: string;
  onRangeChange: (nextRange: string) => void;
};

export default function BarsChart({ bars, symbol, loading, error, range, onRangeChange }: BarsChartProps) {

  const [hoveredBar, setHoveredBar] = useState<HoveredChartPoint | null>(null);
 
  // CARDS SITUATION 
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

  if (bars.length === 0) {
    return (
      <ChartState
        title={symbol}
        description="Showing price history for the selected range"
        statLabel="Bars"
        statValue="0"
        message="No chart data available for this symbol."
      />
    );
  }

  // CHART DATA
  const chartData = bars.map((bar) => ({
    time: bar.t,
    close: bar.c,
  }));

  const summary = getChartSummary(bars);
  const displaySummary = getDisplayChartSummary(summary, hoveredBar);

  // CONFIG
  const chartConfig = {
    close: {
      label: "Close",
      color: "var(--chart-1)",
    },
  } satisfies ChartConfig;

  // TEXT DESCRIPTION
  const descriptionText = `${displaySummary.isPositive ? "+" : ""}${formatPrice(
    displaySummary.absoluteChange
  )} (${displaySummary.isPositive ? "+" : ""}${displaySummary.percentChange.toFixed(2)}%)`;
  
  const descriptionColor = displaySummary.isPositive
    ? "text-emerald-600"
    : displaySummary.isNegative
      ? "text-red-600"
      : "text-muted-foreground";

  // UI RENDER
  return (
    <Card className="py-4 sm:py-0">
      <CardHeader className="flex flex-col items-stretch border-b p-0! sm:flex-row">
        <div className="flex flex-1 flex-col justify-center gap-1 px-6 pb-3 sm:pb-0">
          <CardTitle className="text-xl">{symbol}</CardTitle>
          <CardDescription className={descriptionColor}>{descriptionText}</CardDescription>
        </div>
        <div className="flex">
          <div className="flex flex-1 flex-col justify-center gap-1 border-t px-6 py-4 text-left sm:border-t-0 sm:border-l sm:px-8 sm:py-6">
            <span className="text-xs text-muted-foreground">Latest Close</span>
            <span className="text-lg leading-none font-bold sm:text-3xl">
            {formatPrice(displaySummary.displayClose)}
            </span> 
          </div>
        </div>
      </CardHeader>

      <CardContent className="px-2 sm:p-6">
        <ChartContainer
          config={chartConfig}
          className="aspect-auto h-[250px] w-full"
        >
          <LineChart
            accessibilityLayer
            data={chartData}
            margin={{ left: 12, right: 12 }}
            onMouseMove={(state) => {
              const payload = state?.activePayload?.[0]?.payload;
              if (payload) {
                setHoveredBar({
                  time: payload.time,
                  close: payload.close,
                });
              }
            }}
            onMouseLeave={() => setHoveredBar(null)}
          >
            <CartesianGrid vertical={false} />
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
                  className="w-[150px]"
                  nameKey="close"
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
              dataKey="close"
              type="monotone"
              stroke="var(--color-close)"
              strokeWidth={2}
              dot={false}
            />
          </LineChart>
        </ChartContainer>
        <ButtonRanges value={range} onChange={onRangeChange}/>
      </CardContent>
    </Card>
  );
}