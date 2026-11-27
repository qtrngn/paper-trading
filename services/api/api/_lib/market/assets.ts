import { getAlpacaHeaders, fetchAlpacaJson, ALPACA_TRADING_BASE_URL } from "./alpaca";

type AlpacaAsset = {
  symbol: string;
  name: string; // e.g. "Ford Motor Company"
};

// COMPANY NAME FOR EACH SYMBOL
// Best effort: a name that can't be loaded becomes null instead of failing the caller,
// because a missing name should never block the portfolio from loading.
export async function getAssetNames(symbols: string[]): Promise<Record<string, string | null>> {
  const headers = getAlpacaHeaders();

  const entries = await Promise.all(
    symbols.map(async (symbol): Promise<[string, string | null]> => {
      try {
        const url = new URL(`assets/${encodeURIComponent(symbol)}`, ALPACA_TRADING_BASE_URL);
        const asset = await fetchAlpacaJson<AlpacaAsset>(url, headers);
        return [symbol, asset.name || null];
      } catch {
        return [symbol, null];
      }
    }),
  );

  return Object.fromEntries(entries);
}
