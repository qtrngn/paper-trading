import type { BarUpdate, ChartPoint, TradeUpdate } from '@/features/market/types';

export function useLiveChartPoints(historicalPoints: ChartPoint[], liveBars: BarUpdate[], latestTrade: TradeUpdate | null) {
  const pointsByTime = new Map<string, ChartPoint>();

  historicalPoints.forEach((point) => {
    pointsByTime.set(point.time, point);
  });

  liveBars.forEach((bar) => {
    pointsByTime.set(bar.timestamp, {
      time: bar.timestamp,
      price: bar.close,
    });
  });

  if (latestTrade) {
    pointsByTime.set(latestTrade.timestamp, {
      time: latestTrade.timestamp,
      price: latestTrade.price,
    });
  }

  const points = Array.from(pointsByTime.values()).sort((left, right) => Date.parse(left.time) - Date.parse(right.time));

  return { points };
}
