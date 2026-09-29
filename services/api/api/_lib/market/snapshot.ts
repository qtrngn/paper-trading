import { getAlpacaHeaders, fetchAlpacaJson, getAlpacaBaseUrl } from '../../market/alpaca';
import type { AlpacaQuote, AlpacaTrade, AlpacaBar } from '../../market/_types';

type AlpacaSnapshotData = {
  latestQuote?: AlpacaQuote;
  latestTrade?: AlpacaTrade;
  dailyBar?: AlpacaBar;
};

type AlpacaSnapshotResponse = AlpacaSnapshotData & {
  symbol: string;
};

type AlpacaSnapshotsResponse = Record<string, AlpacaSnapshotData | null>;

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

export type StockSnapshotsResponse = Record<string, StockSnapshotResponse | null>;

// NORMALIZE STOCK SNAPSHOT FROM THE RAW DATA
function normalizeStockSnapshot(symbol: string, data: AlpacaSnapshotData): StockSnapshotResponse {
  const response: StockSnapshotResponse = {
    symbol,
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

export async function getStockSnapshot(symbol: string): Promise<StockSnapshotResponse> {
  const baseUrl = getAlpacaBaseUrl();
  const url = new URL(`stocks/${encodeURIComponent(symbol)}/snapshot`, baseUrl);
  url.search = new URLSearchParams({ feed: 'iex' }).toString();

  const headers = getAlpacaHeaders();
  const data = await fetchAlpacaJson<AlpacaSnapshotResponse>(url, headers);
  return normalizeStockSnapshot(symbol, data);
}

export async function getStockSnapshots(symbols: string[]): Promise<StockSnapshotsResponse> {
  if (symbols.length === 0) {
    return {};
  }
  const baseUrl = getAlpacaBaseUrl();
  const url = new URL(`stocks/snapshots`, baseUrl);
  url.search = new URLSearchParams({ symbols: symbols.join(','), feed: 'iex' }).toString();

  const headers = getAlpacaHeaders();
  const data = await fetchAlpacaJson<AlpacaSnapshotsResponse>(url, headers);
  const snapshots: StockSnapshotsResponse = {};
  for (const symbol of symbols) {
    const rawSnapshot = data[symbol] ?? null;
    snapshots[symbol] = rawSnapshot === null ? null : normalizeStockSnapshot(symbol, rawSnapshot);
  }
  return snapshots;
}
