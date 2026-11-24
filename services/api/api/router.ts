import type { VercelRequest, VercelResponse } from "@vercel/node";
import { barsHandler, quoteHandler, snapshotHandler, searchHandler } from "./_lib/routes/market";
import { listOrdersHandler, submitOrderHandler } from "./_lib/routes/orders";
import { portfolioHandler, portfolioHistoryHandler } from "./_lib/routes/portfolio";

import { getSingleQueryParam } from "./_lib/http/query";

// ONE SERVERLESS FUNCTION FOR THE WHOLE API
// vercel.json rewrites every /api/* request that has no file of its own (everything
// except /api/cron/snapshot) to this function, passing the original path as ?route=.
// The router picks the handler by that path.
// Each handler still checks its own HTTP method (405) and auth (401).

type RouteHandler = (req: VercelRequest, res: VercelResponse) => Promise<unknown>;

const routes: Record<string, RouteHandler> = {
  "market/bars": barsHandler,
  "market/quote": quoteHandler,
  "market/snapshot": snapshotHandler,
  "market/search": searchHandler,
  "orders/orders": listOrdersHandler,
  "orders/submit": submitOrderHandler,
  "portfolio": portfolioHandler,
  "portfolio/history": portfolioHistoryHandler,
};

// "/market/bars/" -> "market/bars"
function normalizeRoute(route: string | undefined): string {
  return (route ?? "").replace(/^\/+|\/+$/g, "");
}

export default async function router(req: VercelRequest, res: VercelResponse) {
  const route = routes[normalizeRoute(getSingleQueryParam(req.query.route))];

  if (!route) {
    return res.status(404).json({ error: "not_found" });
  }

  // Safety net: handlers catch their own errors, but anything they miss
  // becomes a clean 500 instead of a crashed function
  try {
    return await route(req, res);
  } catch (err) {
    console.error("Unhandled API error:", err);
    if (!res.headersSent) {
      return res.status(500).json({ error: "internal_error" });
    }
  }
}
