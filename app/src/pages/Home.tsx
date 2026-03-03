import { auth } from '@/lib/firebase';
import { signOut } from 'firebase/auth';
import { useSymbolSearch } from "@/hooks/useSymbolSearch";
// COMPONENTS
import SearchBar from "@/components/shared/SearchBar"

export default function HomePage() {
  const { query, setQuery, selectedSymbol, submit, loading } = useSymbolSearch();

  return (
    <div>
      <SearchBar loading={loading} value={query} onChange={setQuery} onSubmit={submit} />
      <div>
        {selectedSymbol === null ? "Search a symbol..." : `Quote for ${selectedSymbol}`}
      </div>
      <h2>
        Home page
      </h2>
      <button onClick={() => signOut(auth)}>Sign out</button>
    </div>
  )

}