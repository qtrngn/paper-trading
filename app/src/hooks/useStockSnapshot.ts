import { useQuery } from "@tanstack/react-query";
import { getSnapshot } from "@/features/market/api";

export function useStockSnapshot(symbol: string | null) {
  const query = useQuery({
    queryKey: ["snapshot", symbol],
    queryFn: () => {
      if (!symbol) return null;
      return getSnapshot(symbol);
    },
    enabled: !!symbol,
  });

  return {
    snapshot: query.data ?? null,
    snapshotLoading: query.isLoading,
    snapshotError: query.error,
  };
}