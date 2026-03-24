import type { VercelRequest, VercelResponse } from "@vercel/node";
import { requireUid } from "../_lib/requireUid";
import { getSingleQueryParam } from "../_lib/query";
import { getAlpacaBaseUrl, getAlpacaHeaders, fetchAlpacaJson } from "./alpaca";
import {
  getDateRangeFromLookback,
  getRangeDefinition,
  isChartRange,
  normalizeRange,
  toAlpacaTimeframe,
} from "./chartRange";
import { parseSymbol } from "./symbol";

type AlpacaBar = {
    t: string;
    o: number;
    h: number;
    l: number;
    c: number;
    v: number;
  };
  
  export default async function handler(req: VercelRequest, res: VercelResponse) {
     // METHOD GUARD
    // 1. Check if this is "GET" request
    // 2. If not, reject with 405
    // 3. If yes, start request/auth
    // 4. Run required(uid) to verify authentication 
    // 5. If auth fails, return 401 unauthorized
    if (req.method !== "GET") {
      return res.status(405).json({ error: "Method is not allowed" });
    }
    const requestStartedAt = Date.now();
    
    const authStartedAt = Date.now();

    try {
      await requireUid(req);
      console.log("[bars] authMs =", Date.now() - authStartedAt);
    } catch (err) {
      const message = err instanceof Error ? err.message : "unauthorized";
      return res.status(401).json({ error: "unauthorized", message });
    }
  
     // SYMBOL VALIDATION
    const rawSymbol = getSingleQueryParam(req.query.symbol);
    const symbol = parseSymbol(rawSymbol);
  
    if (!symbol) {
      return res.status(400).json({ error: "Missing or invalid symbol" });
    }
  
    // RANGE
    const rawRange = getSingleQueryParam(req.query.range);
    const range = normalizeRange(rawRange);
  
    if (!isChartRange(range)) {
      return res.status(400).json({ error: "Missing or invalid range" });
    }
  
    const selectedRangeConfig = getRangeDefinition(range);
    const timeframe = toAlpacaTimeframe(selectedRangeConfig.grouping);
    const { start, end } = getDateRangeFromLookback(selectedRangeConfig.lookback);
  
    // ALPACA API CALL
    try {
      const baseUrl = getAlpacaBaseUrl();
      const url = new URL("stocks/bars", baseUrl);
  
      url.search = new URLSearchParams({
        symbols: symbol,
        timeframe,
        start: start.toISOString(),
        end: end.toISOString(),
        feed: "iex",
        sort: "asc",
      }).toString();
  
      const headers = getAlpacaHeaders();

      const alpacaStartedAt = Date.now();
      const data = await fetchAlpacaJson(url, headers);
      console.log("[bars] alpacaMs =", Date.now() - alpacaStartedAt);
  
      const bars: AlpacaBar[] = data.bars?.[symbol] ?? [];
  
      res.setHeader("Cache-Control", "no-store");
  

      console.log("[bars] totalMs =", Date.now() - requestStartedAt, { symbol, range, timeframe });

      return res.status(200).json({
        symbol,
        range,
        timeframe,
        bars,
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : "unknown_error";
      return res.status(502).json({ error: "Alpaca_bars_failed", message });
    }
  }

  

  