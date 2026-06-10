import { useParams, useSearchParams } from "react-router-dom";
import { useStockBars } from "@/hooks/useStockBars";
import BarsChart from "@/components/shared/chart/BarsChart";
import OverviewSection from "@/components/features/stock-detail/OverviewSection";
import TradeTicket from "@/components/features/stock-detail/TradeTicket";

export default function StockDetailPage() {
  // URL STATE
  const { symbol } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
  const selectedSymbol = symbol ?? null;
  const range = searchParams.get("range") ?? "1M";

  function handleRangeChange(nextRange: string) {
    const nextParams = new URLSearchParams(searchParams);
    nextParams.set("range", nextRange);
    setSearchParams(nextParams);
  }

  // CHART STATE
  const { bars, barsLoading, barsError } = useStockBars(selectedSymbol, range);

   return (
    <main className="p-4 shadow-sm sm:p-5">
      <section className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_390px] xl:items-start">
        <BarsChart
          bars={bars}
          symbol={selectedSymbol}
          loading={barsLoading}
          error={barsError}
          range={range}
          onRangeChange={handleRangeChange}
        />

        {selectedSymbol ? (
          <aside className="xl:sticky xl:top-24">
            <TradeTicket symbol={selectedSymbol} />
          </aside>
        ) : null}
      </section>

      <OverviewSection symbol={selectedSymbol} />
    </main>
  );
}



