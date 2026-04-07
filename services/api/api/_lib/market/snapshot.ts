import { getAlpacaHeaders, fetchAlpacaJson, getAlpacaBaseUrl } from "../../market/alpaca";
import type { AlpacaQuote, AlpacaTrade, AlpacaBar } from "../../market/_types";


type AlpacaSnapshotResponse = {
  symbol: string;
  latestQuote?: AlpacaQuote;
  latestTrade?: AlpacaTrade;
  dailyBar?: AlpacaBar;
};

export type StockSnapshotResponse = {
  symbol: string;
  open: number | null;
  high: number | null;
  low: number | null;
  volume: number | null;
  bid: number | null;
  ask: number | null;
  lastSale: number | null;
};

export async function getStockSnapshot(symbol: string) : Promise<StockSnapshotResponse> {

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

    return response;
}


