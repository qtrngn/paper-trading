import type { ChartRange } from "./chartRange";
import { getRangeDefinition, toAlpacaTimeframe } from "./chartRange";
import { fetchAlpacaBars, fetchAlpacaBarsBetween } from "./alpacaBars";
import { getLatestTradingSession } from "./session";
import { getPreviousClose } from "./previousClose";
import type { AlpacaBar } from "./types";

export type ChartData = {
  bars: AlpacaBar[];
  timeframe: string;
  // Only for 1D: the session the chart covers, and the close of the day before it
  session: { open: string; close: string } | null;
  previousClose: number | null;
};

// EVERYTHING THE PRICE CHART NEEDS FOR ONE SYMBOL AND RANGE
export async function getChartData(symbol: string, range: ChartRange): Promise<ChartData> {
  const timeframe = toAlpacaTimeframe(getRangeDefinition(range).grouping);

  if (range !== "1D") {
    const bars = await fetchAlpacaBars(symbol, range);
    return { bars, timeframe, session: null, previousClose: null };
  }

  // 1D = the current (or most recent) trading session, not the last 24 hours
  const session = await getLatestTradingSession();
  const now = new Date();
  const end = now < session.close ? now : session.close;

  const [bars, previousClose] = await Promise.all([
    fetchAlpacaBarsBetween(symbol, timeframe, session.open, end),
    getPreviousClose(symbol, session),
  ]);

  return {
    bars,
    timeframe,
    session: { open: session.open.toISOString(), close: session.close.toISOString() },
    previousClose,
  };
}
