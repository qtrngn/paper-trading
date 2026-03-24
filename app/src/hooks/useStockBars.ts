import { useQuery } from "@tanstack/react-query";
import { getBars } from "@/features/market/api";
import { getCurrentUserToken } from "@/lib/auth";

export function useStockBars(symbol: string | null, range: string) {

  const queryKey = ["bars", symbol, range];

  const barsQuery = useQuery ({
    queryKey: queryKey,
    queryFn: async () => {
      if (!symbol) {
        return [];
      }
      const token = await getCurrentUserToken();
      return getBars(token, symbol, range)
    },
    enabled: !!symbol,
  })


  return { 
    bars: barsQuery.data ?? [],
    barsLoading: barsQuery.isLoading,
    barsError: barsQuery.error ? 'Failed to load bars' : null,
   };
}

 