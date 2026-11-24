import { getAlpacaHeaders, fetchAlpacaJson } from "./alpaca";

// Market calendar lives on the trading API, not the market data API
const ALPACA_TRADING_BASE_URL = "https://paper-api.alpaca.markets/v2/";
const MARKET_TIME_ZONE = "America/New_York";
const CALENDAR_LOOKBACK_DAYS = 10;
const DAY_MS = 24 * 60 * 60 * 1000;

// One trading day from Alpaca's calendar, in New York local time
type AlpacaCalendarDay = {
  date: string; // "2026-11-24"
  open: string; // "09:30"
  close: string; // "16:00" (earlier on half days)
};

export type TradingSession = {
  open: Date;
  close: Date;
};

// Calendar date in New York, as "YYYY-MM-DD"
function getNewYorkDate(date: Date): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: MARKET_TIME_ZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(date);
}

// New York's offset from UTC in minutes at a given moment (-240 in summer, -300 in winter)
function getNewYorkOffsetMinutes(date: Date): number {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: MARKET_TIME_ZONE,
    timeZoneName: "longOffset",
  }).formatToParts(date);
  const offset = parts.find((part) => part.type === "timeZoneName")?.value ?? "";
  const match = /^GMT([+-])(\d{2}):(\d{2})$/.exec(offset);
  if (!match) {
    throw new Error(`Unexpected time zone offset: ${offset}`);
  }
  const minutes = Number(match[2]) * 60 + Number(match[3]);
  return match[1] === "-" ? -minutes : minutes;
}

// Turn a New York wall-clock time ("2026-11-24" + "09:30") into a real UTC moment
function newYorkTimeToUtc(date: string, time: string): Date {
  const wallClockAsUtc = new Date(`${date}T${time}:00Z`);
  const offsetMinutes = getNewYorkOffsetMinutes(wallClockAsUtc);
  return new Date(wallClockAsUtc.getTime() - offsetMinutes * 60_000);
}

// THE SESSION A 1D CHART SHOULD SHOW
// Today's session if it has already opened, otherwise the most recent one before it
export async function getLatestTradingSession(now: Date = new Date()): Promise<TradingSession> {
  const url = new URL("calendar", ALPACA_TRADING_BASE_URL);
  url.search = new URLSearchParams({
    start: getNewYorkDate(new Date(now.getTime() - CALENDAR_LOOKBACK_DAYS * DAY_MS)),
    end: getNewYorkDate(now),
  }).toString();

  const days = await fetchAlpacaJson<AlpacaCalendarDay[]>(url, getAlpacaHeaders());

  // Newest first: pick the first day whose open is not in the future
  for (let i = days.length - 1; i >= 0; i--) {
    const day = days[i];
    const open = newYorkTimeToUtc(day.date, day.open);
    if (open.getTime() <= now.getTime()) {
      return { open, close: newYorkTimeToUtc(day.date, day.close) };
    }
  }

  throw new Error("No trading session found");
}
