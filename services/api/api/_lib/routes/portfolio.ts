import type { VercelRequest, VercelResponse } from "@vercel/node";
import { requireMethod } from "../http/requireMethod";
import { requireUid } from "../auth/requireUid";
import { getPortfolio } from "../trading/portfolio";
import { getPortfolioHistory } from "../trading/portfolioHistory";

// GET /api/portfolio
export async function portfolioHandler(req: VercelRequest, res: VercelResponse) {
  if (!requireMethod(req, res, "GET")) return;
  let uid: string;
  try {
    uid = await requireUid(req);
  } catch {
    return res.status(401).json({ error: "unauthorized" });
  }
  try {
    const portfolio = await getPortfolio(uid);
    res.setHeader("Cache-Control", "no-store");
    return res.status(200).json(portfolio);
  } catch (err) {
    const message = err instanceof Error ? err.message : "unknown_error";
    return res.status(500).json({ error: "failed_to_load_portfolio", message });
  }
}

// GET /api/portfolio/history
export async function portfolioHistoryHandler(req: VercelRequest, res: VercelResponse) {
  if (!requireMethod(req, res, "GET")) return;
  let uid: string;
  try {
    uid = await requireUid(req);
  } catch {
    return res.status(401).json({ error: "unauthorized" });
  }
  try {
    const history = await getPortfolioHistory(uid);
    const points = history.map((doc) => ({
      timestamp: doc.timestamp.toISOString(),
      cash: doc.cash,
      marketValue: doc.marketValue,
      equity: doc.equity,
    }));
    res.setHeader("Cache-Control", "no-store");
    return res.status(200).json({ points });
  } catch (err) {
    const message = err instanceof Error ? err.message : "unknown_error";
    return res.status(500).json({ error: "failed_to_load_portfolio_history", message });
  }
}
