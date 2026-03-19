import { CartesianGrid, Line, LineChart, XAxis } from "recharts";
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

import type { Bar } from "@/features/market/types";

type BarsChartProps = {
  bars: Bar[];
  symbol: string;
};

export default function BarsChart({ bars, symbol }: BarsChartProps) {
  const chartData = bars.map((bar) => ({
    time: bar.t,
    close: bar.c,
  }));

  const chartConfig = {
    close: {
      label: "Close",
      color: "hsl(var(--chart-1))",
    },
  } satisfies ChartConfig;

  // Fallback if bars data is not available
  if (bars.length === 0) {
    return (
      <Card className="py-4 sm:py-0">
        <CardHeader className="border-b px-6 py-4">
          <CardTitle>Price Chart</CardTitle>
          <CardDescription>Recent price movement</CardDescription>
        </CardHeader>
        <CardContent className="px-6 py-10">
          <p>No chart data available.</p>
        </CardContent>
      </Card>
    );
  };

  const latestBar = bars[bars.length-1];
  // 
  return (
    <Card className="py-4 sm:py-0">
      <CardHeader className="border-b px-6 py-4">
        <CardTitle>{symbol}</CardTitle>
        <CardDescription>Latest close: {latestBar.c}</CardDescription>
      </CardHeader>

      <CardContent className="px-2 sm:p-6">
        <ChartContainer config={chartConfig} className="aspect-auto h-[250px] w-full">
          <LineChart
            accessibilityLayer
            data={chartData}
            margin={{ left: 12, right: 12 }}
          >
            <CartesianGrid vertical={false} />

            <XAxis
              dataKey="time"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              minTickGap={32}
              tickFormatter={(value) => {
                return new Date(value).toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                });
              }}
            />

            <ChartTooltip
              content={
                <ChartTooltipContent
                  nameKey="close"
                  labelFormatter={(value) => {
                    return new Date(value).toLocaleString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                      hour: "numeric",
                      minute: "2-digit",
                    });
                  }}
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
      </CardContent>
    </Card>
  );
}