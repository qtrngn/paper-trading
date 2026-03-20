import { useState } from "react";
import { auth } from "@/lib/firebase";
import { signOut } from "firebase/auth";
import { useSymbolSearch } from "@/hooks/useSymbolSearch";
import { useStockBars } from "@/hooks/useStockBars";

import SearchBar from "@/components/shared/SearchBar";
import BarsChart from "@/components/features/dashboard/BarsChart";

export default function Dashboard() {
  const { query, setQuery, selectedSymbol, submit } = useSymbolSearch();
  const [range, setRange] = useState("1M");

  const { bars, barsLoading, barsError } = useStockBars(selectedSymbol, range);

  return (
    <main className="min-h-screen bg-stone-50 text-neutral-900">
      <div className="flex min-h-screen w-full flex-col gap-6 px-4 py-6 sm:px-6 lg:px-8">
        <header className="flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-sm font-medium text-neutral-500">Paper Trading</p>
            <h1 className="text-3xl font-semibold tracking-tight">Dashboard</h1>
          </div>

          <button
            onClick={() => signOut(auth)}
            className="rounded-full border border-neutral-200 bg-white px-4 py-2 text-sm font-medium text-neutral-700 shadow-sm transition hover:bg-neutral-100"
          >
            Sign out
          </button>
        </header>

        <section className="rounded-[28px] border border-neutral-200 bg-white p-4 shadow-sm sm:p-6">
          <SearchBar value={query} onChange={setQuery} onSubmit={submit} />
        </section>

        <section className="grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1fr)_320px]">
          <div className="space-y-4">
            <div className="rounded-[28px] border border-neutral-200 bg-white p-4 shadow-sm sm:p-5">
              <BarsChart
                bars={bars}
                symbol={selectedSymbol}
                loading={barsLoading}
                error={barsError}
                range={range}
                onRangeChange={setRange}
              />
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}