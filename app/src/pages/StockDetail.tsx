import { useParams, useSearchParams } from "react-router-dom";
import { useStockBars } from "@/hooks/useStockBars";
import BarsChart from "@/components/shared/chart/BarsChart";
import OverviewSection from "@/components/features/stock-detail/OverviewSection";

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
    <div className="p-4 shadow-sm sm:p-5">
      <BarsChart
        bars={bars}
        symbol={selectedSymbol}
        loading={barsLoading}
        error={barsError}
        range={range}
        onRangeChange={handleRangeChange}
      />
      <OverviewSection symbol={selectedSymbol} />
    </div>
  );
}
