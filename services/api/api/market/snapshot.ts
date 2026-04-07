import { VercelRequest, VercelResponse } from "@vercel/node";
import { requireUid } from "../_lib/auth/requireUid";
import { parseSymbol } from "./symbol";
import { getSingleQueryParam } from "../_lib/http/query";
import { requireMethod } from "../_lib/http/requireMethod";
import { getStockSnapshot } from "../_lib/market/snapshot";

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

  // ALPACA SNAPSHOT
  try {
    const snapshot = await getStockSnapshot(symbol); 
    res.setHeader("Cache-Control", "no-store");
    return res.status(200).json(snapshot);
  } catch (err) {
    const message = err instanceof Error ? err.message : "unknown_error";
    return res.status(502).json({ error: "Alpaca_snapshot_failed", message });
  }
}
