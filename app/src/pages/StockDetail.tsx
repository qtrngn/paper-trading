import { useParams, useSearchParams } from 'react-router-dom';
import { useStockBars } from '@/hooks/useStockBars';
import { useStockSnapshot } from '@/hooks/useStockSnapshot';
import { useRealtimeMarketData } from '@/hooks/useRealtimeMarketData';
import { useLiveChartPoints } from '@/hooks/useLiveChartPoints';
import BarsChart from '@/components/shared/chart/BarsChart';
import OverviewSection from '@/components/features/stock-detail/OverviewSection';
import TradeTicket from '@/components/features/stock-detail/TradeTicket';
import type { ChartPoint } from '@/features/market/types';

export default function StockDetailPage() {
  // URL STATE
  const { symbol } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
  const selectedSymbol = symbol ?? null;
  const range = searchParams.get('range') ?? '1M';

  function handleRangeChange(nextRange: string) {
    const nextParams = new URLSearchParams(searchParams);
    nextParams.set('range', nextRange);
    setSearchParams(nextParams);
  }

  // CHART STATE
  const { bars, barsLoading, barsError } = useStockBars(selectedSymbol, range);
  const { snapshot } = useStockSnapshot(selectedSymbol);
  const { latestQuote, latestTrade, liveBars } = useRealtimeMarketData(selectedSymbol);
  const historicalPoints: ChartPoint[] = bars.map((bar) => ({
    time: bar.t,
    price: bar.c,
  }));
  const { points } = useLiveChartPoints(historicalPoints, range === '1D' ? liveBars : [], latestTrade);
  const resolvedLastSale = latestTrade?.price ?? snapshot?.lastSale ?? null;
  const resolvedBid = latestQuote?.bidPrice ?? snapshot?.bid ?? null;
  const resolvedAsk = latestQuote?.askPrice ?? snapshot?.ask ?? null;

  return (
    <main className="p-4 shadow-sm sm:p-5">
      <section className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_390px] xl:items-start">
        <BarsChart
          points={points}
          symbol={selectedSymbol}
          loading={barsLoading}
          error={barsError}
          range={range}
          onRangeChange={handleRangeChange}
        />

        {selectedSymbol ? (
          <aside className="xl:sticky xl:top-24">
            <TradeTicket key={selectedSymbol} symbol={selectedSymbol} bidPrice={resolvedBid ?? null} askPrice={resolvedAsk ?? null} />
          </aside>
        ) : null}
      </section>

      <OverviewSection symbol={selectedSymbol} snapshot={snapshot} lastSale={resolvedLastSale} bid={resolvedBid} ask={resolvedAsk} />
    </main>
  );
}
