import type { VercelRequest, VercelResponse } from "@vercel/node";
import { requireMethod } from "../_lib/requireMethod";
import { requireUid } from "../_lib/requireUid";
import { getSingleQueryParam } from "../_lib/query";

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

// HELPERS
async function searchMarketSuggestions(query: string): Promise<SearchSuggestion[]> {
  // FINNHUB API CALL
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

  return suggestions;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (!requireMethod(req, res, "GET")) return;
  try {
    await requireUid(req);
  } catch (err) {
    const message = err instanceof Error ? err.message : "unauthorized";
    return res.status(401).json({ error: "unauthorized", message });
  }

  const q = getSingleQueryParam(req.query.q)?.trim();

  if (!q || q.length < 2) {
    res.setHeader("Cache-Control", "no-store");
    return res.status(200).json({ suggestions: [] });
  }
  try {
    res.setHeader("Cache-Control", "no-store");
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
