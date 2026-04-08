import { VercelRequest, VercelResponse } from "@vercel/node";
import { ObjectId } from "mongodb";
import { requireMethod } from "../_lib/http/requireMethod";
import { requireUid } from "../_lib/auth/requireUid";
import { getOrCreateAccount } from "../_lib/trading/account";
import { getStockSnapshot } from "../_lib/market/snapshot";
import { executeOrder } from "../_lib/trading/orderExecution";
import { getPositionBySymbol } from "../_lib/trading/position";
import { parseSymbol } from "../market/symbol";
import { buildOrderDoc } from "../_lib/trading/order";
import { getDb } from "../_lib/db/mongo";
import type { OrderDoc } from "../_lib/trading/order";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // METHOD GUARD
  if (!requireMethod(req, res, "POST")) return;
  let uid: string;
  try {
    uid = await requireUid(req);
  } catch (err) {
    const message = err instanceof Error ? err.message : "unauthorized";
    return res.status(401).json({ error: "unauthorized", message });
  }

  // RAW INPUT
  const { rawSymbol, side, qty, type, limitPrice } = req.body ?? {};

  // PARSED VALUES
  const symbol = parseSymbol(rawSymbol);
  const qtyNumber = Number(qty);
  const limitPriceNumber = Number(limitPrice);

  // REQUEST VALIDATION
  if (!symbol) {
    return res.status(400).json({ error: "Missing or invalid symbol" });
  }

  if (side !== "buy" && side !== "sell") {
    return res.status(400).json({ error: "Missing or invalid side" });
  }

  if (!Number.isFinite(qtyNumber) || qtyNumber <= 0) {
    return res.status(400).json({ error: "Missing or invalid quantity" });
  }

  if (type !== "market" && type !== "limit") {
    return res.status(400).json({ error: "Missing or invalid type" });
  }

  if (type === "limit" && (!Number.isFinite(limitPriceNumber) || limitPriceNumber <= 0)) {
    return res.status(400).json({ error: "Missing or invalid limit price" });
  }

  // LOAD ACCOUNT AND MARKET DATA
  try {
    const db = await getDb();
    const orders = db.collection<OrderDoc>("orders");
    const account = await getOrCreateAccount(uid);
    const snapshot = await getStockSnapshot(symbol);
    const existingPosition = await getPositionBySymbol(uid, symbol);
    const executionResult = executeOrder({
      side,
      orderType: type,
      qtyNumber,
      limitPriceNumber,
      snapshot,
      account,
      existingPosition,
    });

    if (!executionResult.ok) {
      return res.status(executionResult.statusCode).json({ error: executionResult.error });
    }
    const { executionPrice, orderValue, status } = executionResult;

    const now = new Date();
    const id = new ObjectId().toHexString();
    const order = buildOrderDoc({
      id,
      uid,
      symbol,
      side,
      qty: qtyNumber,
      type,
      limitPrice: type === "limit" ? limitPriceNumber : null,
      status,
      executionPrice,
      now,
    });

    await orders.insertOne(order);

    return res.status(200).json({
      ok: true,
      order,
    });
  } catch (err) {
    return res.status(502).json({ error: "Failed to load account or market data" });
  }
}
