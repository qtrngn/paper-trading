import { useQuery } from "@tanstack/react-query";
import { getBars } from "@/features/market/api";

export function useStockBars(symbol: string | null, range: string) {

  const queryKey = ["bars", symbol, range];

  const barsQuery = useQuery ({
    queryKey: queryKey,
    queryFn: async () => {
      if (!symbol) {
        throw new Error("Symbol is required");
      }
      return getBars(symbol, range);
    },
    enabled: !!symbol,
  })


  return { 
    bars: barsQuery.data?.bars ?? [],
    timeframe: barsQuery.data?.timeframe ?? null,
    barsLoading: barsQuery.isLoading,
    barsError: barsQuery.error ? 'Failed to load bars' : null,
   };
}

 