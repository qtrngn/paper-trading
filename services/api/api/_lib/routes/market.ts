import type { VercelRequest, VercelResponse } from "@vercel/node";
import { requireMethod } from "../http/requireMethod";
import { requireUid } from "../auth/requireUid";
import { getSingleQueryParam } from "../http/query";
import { parseSymbol } from "../market/symbol";
import { getChartData } from "../market/chartData";
import { normalizeRange, isChartRange } from "../market/chartRange";
import { getLatestQuote } from "../market/quote";
import { getStockSnapshot } from "../market/snapshot";
import { getAssetNames } from "../market/assets";
import { searchMarketSuggestions } from "../market/search";

// GET /api/market/bars?symbol=AAPL&range=1M
export async function barsHandler(req: VercelRequest, res: VercelResponse) {
  // METHOD GUARD
  if (!requireMethod(req, res, "GET")) return;
  try {
    await requireUid(req);
  } catch (err) {
    const message = err instanceof Error ? err.message : "unauthorized";
    return res.status(401).json({ error: "unauthorized", message });
  }

  // SYMBOL VALIDATION
  const rawSymbol = getSingleQueryParam(req.query.symbol);
  const symbol = parseSymbol(rawSymbol);

  if (!symbol) {
    return res.status(400).json({ error: "Missing or invalid symbol" });
  }

  // RANGE
  const rawRange = getSingleQueryParam(req.query.range);
  const range = normalizeRange(rawRange);

  if (!isChartRange(range)) {
    return res.status(400).json({ error: "Missing or invalid range" });
  }
  // ALPACA API CALL
  try {
    const { bars, timeframe, session, previousClose } = await getChartData(symbol, range);
    res.setHeader("Cache-Control", "no-store");

    return res.status(200).json({
      symbol,
      range,
      bars,
      timeframe,
      session,
      previousClose,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "unknown_error";
    return res.status(502).json({ error: "Alpaca_bars_failed", message });
  }
}

// GET /api/market/quote?symbol=AAPL
export async function quoteHandler(req: VercelRequest, res: VercelResponse) {
  // METHOD GUARD
  if (!requireMethod(req, res, "GET")) return;
  try {
    await requireUid(req);
  } catch (err) {
    const message = err instanceof Error ? err.message : "unauthorized";
    return res.status(401).json({ error: "unauthorized", message });
  }

  // SYMBOL VALIDATION
  const rawSymbol = getSingleQueryParam(req.query.symbol);
  const symbol = parseSymbol(rawSymbol);

  if (!symbol) {
    return res.status(400).json({ error: "Missing or invalid symbol" });
  }

  // ALPACA API CALL
  try {
    const data = await getLatestQuote(symbol);
    res.setHeader("Cache-Control", "no-store");
    return res.status(200).json(data);
  } catch (err) {
    const message = err instanceof Error ? err.message : "unknown_error";
    return res.status(502).json({ error: "Alpaca_quote_failed", message });
  }
}

// GET /api/market/snapshot?symbol=AAPL
export async function snapshotHandler(req: VercelRequest, res: VercelResponse) {
  // METHOD GUARD
  if (!requireMethod(req, res, "GET")) return;
  try {
    await requireUid(req);
  } catch (err) {
    const message = err instanceof Error ? err.message : "unauthorized";
    return res.status(401).json({ error: "unauthorized", message });
  }

  // SYMBOL VALIDATION
  const rawSymbol = getSingleQueryParam(req.query.symbol);
  const symbol = parseSymbol(rawSymbol);

  if (!symbol) {
    return res.status(400).json({ error: "Missing or invalid symbol" });
  }

  // ALPACA SNAPSHOT + COMPANY NAME
  try {
    const [snapshot, names] = await Promise.all([getStockSnapshot(symbol), getAssetNames([symbol])]);
    res.setHeader("Cache-Control", "no-store");
    return res.status(200).json({ ...snapshot, name: names[symbol] ?? null });
  } catch (err) {
    const message = err instanceof Error ? err.message : "unknown_error";
    return res.status(502).json({ error: "Alpaca_snapshot_failed", message });
  }
}

// GET /api/market/search?q=app
export async function searchHandler(req: VercelRequest, res: VercelResponse) {
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
