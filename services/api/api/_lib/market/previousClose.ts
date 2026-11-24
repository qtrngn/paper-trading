import { getAlpacaBaseUrl, getAlpacaHeaders, fetchAlpacaJson } from "./alpaca";
import { getNewYorkDate, type TradingSession } from "./session";
import type { AlpacaBar } from "./types";

const DAILY_BARS_LOOKBACK_DAYS = 10;
const DAY_MS = 24 * 60 * 60 * 1000;

type AlpacaBarsResponse = {
  bars: Record<string, AlpacaBar[]>;
};

// CLOSING PRICE OF THE TRADING DAY BEFORE THE GIVEN SESSION
// Returns null when there is no earlier daily bar (e.g. a newly listed stock)
export async function getPreviousClose(symbol: string, session: TradingSession): Promise<number | null> {
  const baseUrl = getAlpacaBaseUrl();
  const url = new URL("stocks/bars", baseUrl);
  url.search = new URLSearchParams({
    symbols: symbol,
    timeframe: "1Day",
    start: new Date(session.open.getTime() - DAILY_BARS_LOOKBACK_DAYS * DAY_MS).toISOString(),
    end: session.open.toISOString(),
    feed: "iex",
    sort: "asc",
  }).toString();

  const data = await fetchAlpacaJson<AlpacaBarsResponse>(url, getAlpacaHeaders());
  const dailyBars = data.bars?.[symbol] ?? [];

  // Daily bars are stamped at midnight New York time, so the session's own bar can
  // still show up here. Keep only days strictly before the session.
  const earlierBars = dailyBars.filter((bar) => getNewYorkDate(new Date(bar.t)) < session.date);
  const lastBar = earlierBars[earlierBars.length - 1];

  return lastBar ? lastBar.c : null;
}
