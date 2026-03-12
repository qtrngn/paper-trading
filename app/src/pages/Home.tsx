import { auth } from '@/lib/firebase';
import { signOut } from 'firebase/auth';
import { useSymbolSearch } from "@/hooks/useSymbolSearch";
import { useStockQuote } from '@/hooks/useStockQuote';
// COMPONENTS
import SearchBar from "@/components/shared/SearchBar"

export default function HomePage() {
  const { query, setQuery, selectedSymbol, submit } = useSymbolSearch();
  const { quote, loading, error } = useStockQuote(selectedSymbol);

  return (
    <div>
      <SearchBar value={query} onChange={setQuery} onSubmit={submit} />
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