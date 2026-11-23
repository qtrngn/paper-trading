import { getAlpacaHeaders, fetchAlpacaJson, getAlpacaBaseUrl } from "./alpaca";
import type { AlpacaQuote } from "./types";

// LATEST QUOTE FROM ALPACA (IEX FEED)
export async function getLatestQuote(symbol: string): Promise<AlpacaQuote> {
  const baseUrl = getAlpacaBaseUrl();
  const url = new URL(`stocks/${encodeURIComponent(symbol)}/quotes/latest`, baseUrl);
  url.search = new URLSearchParams({ feed: "iex" }).toString();

  const headers = getAlpacaHeaders();
  return fetchAlpacaJson<AlpacaQuote>(url, headers);
}
