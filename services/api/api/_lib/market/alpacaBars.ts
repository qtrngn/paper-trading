import type { ChartRange } from "./chartRange";
import { getDateRangeFromLookback, getRangeDefinition, toAlpacaTimeframe } from "./chartRange";
import { getAlpacaBaseUrl, getAlpacaHeaders, fetchAlpacaJson } from "./alpaca";
import type { AlpacaBar } from "./types";

type AlpacaBarsResponse = {
  bars: Record<string, AlpacaBar[]>;
};

// BARS FOR AN EXACT TIME WINDOW
export async function fetchAlpacaBarsBetween(
  symbol: string,
  timeframe: string,
  start: Date,
  end: Date,
): Promise<AlpacaBar[]> {
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
  const data = await fetchAlpacaJson<AlpacaBarsResponse>(url, headers);
  const bars: AlpacaBar[] = data.bars?.[symbol] ?? [];

  return bars;
}

// BARS FOR A RANGE, LOOKING BACK FROM NOW
export async function fetchAlpacaBars(symbol: string, range: ChartRange): Promise<AlpacaBar[]> {
  const selectedRangeConfig = getRangeDefinition(range);
  const timeframe = toAlpacaTimeframe(selectedRangeConfig.grouping);
  const { start, end } = getDateRangeFromLookback(selectedRangeConfig.lookback);

  return fetchAlpacaBarsBetween(symbol, timeframe, start, end);
}
