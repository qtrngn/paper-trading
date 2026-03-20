import { useState, useEffect, useCallback } from "react";
import type { Bar } from "@/features/market/types";
import { getBars } from "@/features/market/api";
import { getCurrentUserToken } from "@/lib/auth";

export function useStockBars(symbol: string | null, range: string) {
  const [bars, setBars] = useState<Bar[]>([]);
  const [barsLoading, setBarsLoading] = useState(false);
  const [barsError, setBarsError] = useState<string | null>(null);

  const fetchBars = useCallback(async (nextSymbol: string, nextRange: string) => {
    setBarsLoading(true);
    setBarsError(null);

    try {
      const token = await getCurrentUserToken();

      const data = await getBars(token, nextSymbol, nextRange);

      setBars(data);
    } catch {
      setBars([]);
      setBarsError('Failed to load bars');
    } finally {
      setBarsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!symbol || !range) {
      setBars([]);
      setBarsError(null);
      setBarsLoading(false);
      return;
    }

    fetchBars(symbol, range);
  }, [symbol, range, fetchBars]);

  return { bars, barsLoading, barsError };
}