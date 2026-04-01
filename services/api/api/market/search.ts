import type { VercelRequest, VercelResponse } from "@vercel/node";
import { requireMethod } from "../_lib/requireMethod";
import { requireUid } from "../_lib/requireUid";
import { getSingleQueryParam } from "../_lib/query";
import { parseSymbol } from "../market/symbol";
import { fetchAlpacaBars } from "./alpacaBars";

type RawSearchSuggestion = {
  symbol: string;
  description: string;
};

type RawSearchResponse = {
  count: number;
  result: RawSearchSuggestion[];
};

type SearchSuggestion = {
  symbol: string;
  name: string;
};

// CHECK IF SYMBOL HAS CHART DATA FOR SUGGESTION FILTERING
async function supportsChartData(rawSymbol: string): Promise<boolean> {
  const symbol = parseSymbol(rawSymbol);
  if (!symbol) {
    return false;
  }
  try {
    const bars = await fetchAlpacaBars(symbol, "1D");
    return Array.isArray(bars) && bars.length > 0;
  } catch {
    return false;
  }
}

// SEARCH MARKET SUGGESTIONS (FINNHUB)
async function searchMarketSuggestions(query: string): Promise<SearchSuggestion[]> {
  // FINNHUB api call
  const finnhubApiKey = process.env.FINNHUB_API_KEY;
  if (!finnhubApiKey) {
    throw new Error("Missing Finnhub API key");
  }

  const baseUrl = process.env.FINNHUB_BASE_URL;
  if (!baseUrl) {
    throw new Error("Missing Finnhub base URL");
  }
  const url = new URL("search", baseUrl);
  url.search = new URLSearchParams({
    q: query,
    // exchange: "US",
    token: finnhubApiKey,
  }).toString();

  const response = await fetch(url);
  if (!response.ok) {
    const body = await response.text();
    throw new Error(`Finnhub ${response.status}: ${body.slice(0, 100)}`);
  }

  const rawResponse = (await response.json()) as RawSearchResponse;

  const suggestions = rawResponse.result.map((s) => ({
    symbol: s.symbol,
    name: s.description,
  }));

  const normalizedQuery = query.trim().toUpperCase();

  function getSuggestionScore(suggestion: SearchSuggestion): number {
    const symbol = suggestion.symbol.toUpperCase();
    const name = suggestion.name.toUpperCase();

    if (symbol === normalizedQuery) {
      return 500;
    }

    if (symbol.startsWith(normalizedQuery)) {
      return 400;
    }

    if (name.startsWith(normalizedQuery)) {
      return 300;
    }

    if (symbol.includes(normalizedQuery)) {
      return 200;
    }

    if (name.includes(normalizedQuery)) {
      return 100;
    }

    return 0;
  }

  const rankedSuggestions = suggestions.map((suggestion, index) => ({
    suggestion,
    score: getSuggestionScore(suggestion),
    index,
  })).sort((a, b) => {
      if (b.score !== a.score) {
        return b.score - a.score;
      }
      return a.index - b.index;
    }).map((entry) => entry.suggestion);

  const candidateSuggestions = rankedSuggestions.slice(0, 8);

  const supportChecks = await Promise.all(candidateSuggestions.map(async (suggestion) => {
      const supported = await supportsChartData(suggestion.symbol);
      if (!supported) {
        return null;
      }

      return suggestion;
    }),
  );

  const supportedSuggestions = supportChecks.filter((suggestion): suggestion is SearchSuggestion => suggestion !== null);
  if (supportedSuggestions.length > 0) {
    return supportedSuggestions.slice(0, 8);
  }
  return rankedSuggestions.slice(0, 8);
}

// API SEARCH HANDLER
export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (!requireMethod(req, res, "GET")) return;
  try {
    await requireUid(req);
  } catch (err) {
    const message = err instanceof Error ? err.message : "unauthorized";
    return res.status(401).json({ error: "unauthorized", message });
  }

  const q = getSingleQueryParam(req.query.q)?.trim();
  res.setHeader("Cache-Control", "no-store");

  if (!q || q.length < 2) {
    return res.status(200).json({ suggestions: [] });
  }
  try {
    const suggestions = await searchMarketSuggestions(q);
    return res.status(200).json({ suggestions });
  } catch (error) {
    const message = error instanceof Error ? error.message : "unknown_error";
    return res.status(502).json({
      error: "search_failed",
      message,
    });
  }
}
