import { VercelRequest, VercelResponse } from "@vercel/node";
import { requireUid } from "../_lib/requireUid";
import { parseSymbol } from "./symbol";
import { getAlpacaHeaders, fetchAlpacaJson, getAlpacaBaseUrl } from "./alpaca";
import { getSingleQueryParam } from "../_lib/query";
import { requireMethod } from "../_lib/requireMethod";
import type { AlpacaQuote, AlpacaTrade, AlpacaBar } from "./_types";

type AlpacaSnapshotResponse = {
  symbol: string;
  latestQuote?: AlpacaQuote;
  latestTrade?: AlpacaTrade;
  dailyBar?: AlpacaBar;
};

type StockSnapshotResponse = {
  symbol: string;
  open: number | null;
  high: number | null;
  low: number | null;
  volume: number | null;
  bid: number | null;
  ask: number | null;
  lastSale: number | null;
};

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // METHOD GUARD
  if (!requireMethod(req, res, "GET")) return;
  try {
    await requireUid(req);
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

  // ALPACA API CALL
  try {
    const baseUrl = getAlpacaBaseUrl();
    const url = new URL(`stocks/${encodeURIComponent(symbol)}/snapshot`, baseUrl);
    url.search = new URLSearchParams({ feed: "iex" }).toString();

    const headers = getAlpacaHeaders();
    const data = await fetchAlpacaJson<AlpacaSnapshotResponse>(url, headers);

    const response: StockSnapshotResponse = {
      symbol: data.symbol,
      open: data.dailyBar?.o ?? null,
      high: data.dailyBar?.h ?? null,
      low: data.dailyBar?.l ?? null,
      volume: data.dailyBar?.v ?? null,
      bid: data.latestQuote?.bp ?? null,
      ask: data.latestQuote?.ap ?? null,
      lastSale: data.latestTrade?.p ?? null,
    };
    res.setHeader("Cache-Control", "no-store");
    return res.status(200).json(response);
  } catch (err) {
    const message = err instanceof Error ? err.message : "unknown_error";
    return res.status(502).json({ error: "Alpaca_snapshot_failed", message });
  }
}
