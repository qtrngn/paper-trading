import { auth } from '@/lib/firebase';
import { signOut } from 'firebase/auth';
import { useSymbolSearch } from "@/hooks/useSymbolSearch";
import { useStockQuote } from '@/hooks/useStockQuote';
// COMPONENTS
import SearchBar from "@/components/shared/SearchBar";
import BarsChart from '@/components/shared/BarsChart';
import type { Bar } from "@/features/market/types";

export default function HomePage() {
  const { query, setQuery, selectedSymbol, submit } = useSymbolSearch();
  const { quote, loading, error } = useStockQuote(selectedSymbol);

  const tempBars: Bar[] = [
    { t: "2026-03-13T10:00:00Z", o: 210, h: 212, l: 209, c: 211, v: 1000 },
    { t: "2026-03-14T10:00:00Z", o: 211, h: 213, l: 210, c: 212, v: 1200 },
    { t: "2026-03-15T10:00:00Z", o: 212, h: 214, l: 211, c: 213, v: 900 },
  ]

  return (
    <div>
      <SearchBar value={query} onChange={setQuery} onSubmit={submit} />
      <div>
      <BarsChart bars={tempBars}/>

      </div>
      <div>
        {selectedSymbol === null ? (
          "Search a symbol..."
        ) : loading ? (
          `Loading quote for ${selectedSymbol}...`
        ) : error ? (
          `Error: ${error}`
        ) : quote ? (
          <pre>{JSON.stringify(quote, null, 2)}</pre>
        ) : (
          "No quote yet."
        )}
      </div>
      <h2>
        Home page
      </h2>
      <button onClick={() => signOut(auth)}>Sign out</button>
    </div>
  )

}