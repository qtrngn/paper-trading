import type { VercelRequest, VercelResponse } from "@vercel/node";
import { requireMethod } from "../_lib/requireMethod";
import { requireUid } from "../_lib/requireUid";
import { getSingleQueryParam } from "../_lib/query";
import { parseSymbol } from "./symbol";
import  { fetchAlpacaBars } from "./alpacaBars";
import { normalizeRange, isChartRange } from "./chartRange";



export default async function handler(req: VercelRequest, res: VercelResponse) {
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
    const bars = await fetchAlpacaBars(symbol, range);
    res.setHeader("Cache-Control", "no-store");

    return res.status(200).json({
      symbol,
      range,
      bars,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "unknown_error";
    return res.status(502).json({ error: "Alpaca_bars_failed", message });
  }
}



