import { VercelRequest, VercelResponse } from "@vercel/node";
import { ObjectId } from "mongodb";
import { requireMethod } from "../_lib/http/requireMethod";
import { requireUid } from "../_lib/auth/requireUid";
import { getOrCreateAccount } from "../_lib/trading/account";
import { getStockSnapshot } from "../_lib/market/snapshot";
import { executeOrder } from "../_lib/trading/orderExecution";
import { getPositionBySymbol, type PositionDoc } from "../_lib/trading/position";
import { parseSymbol } from "../market/symbol";
import { getDb } from "../_lib/db/mongo";
import { buildOrderDoc } from "../_lib/trading/order";
import { buildActivityDoc } from "../_lib/trading/activities";
import type { OrderDoc } from "../_lib/trading/order";
import type { ActivityDoc, ActivityType } from "../_lib/trading/activities";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  /*  METHOD GUARD
  Only allow POST method for order submission */
  if (!requireMethod(req, res, "POST")) return;

  /* AUTH
  Get the authenticated user's uid
  If failed, stop immediately */
  let uid: string;
  try {
    uid = await requireUid(req);
  } catch (err) {
    const message = err instanceof Error ? err.message : "unauthorized";
    return res.status(401).json({ error: "unauthorized", message });
  }

  /* 
  READ RAW REQUEST INPUT
  This is the raw body coming from the client
  "symbol" from the request is stored locally as "rawSymbol" */
  const { symbol: rawSymbol, side, qty, type, limitPrice } = req.body ?? {};

  /* PARSE VALUE INTO USABLE VALUES
  symbol gets normalized/validated by parseSymbol, 
  qty and limitPrice get converted into numbers */
  const symbol = parseSymbol(rawSymbol);
  const qtyNumber = Number(qty);
  const limitPriceNumber = Number(limitPrice);

  /* REQUEST VALIDATION
  Failed early before doing DB work or market data access */
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

  /* MAIN SUBMIT FLOW
 Everything below can fail due to DB/provider issues, so it is wrapped in try/catch */
  try {
    /* Get DB + collections
    These are the persistent stores we need to touch */
    const db = await getDb();
    const orders = db.collection<OrderDoc>("orders");
    const accounts = db.collection("accounts");
    const positions = db.collection<PositionDoc>("positions");
    const activities = db.collection<ActivityDoc>("activities");

    /* Load dependencies required to evaluate the order
    account = user cash state
    snapshot = current market data
    existingPosition = current holding for this symbol
    */
    const account = await getOrCreateAccount(uid);
    const snapshot = await getStockSnapshot(symbol);
    const existingPosition = await getPositionBySymbol(uid, symbol);

    /* Run execution logic
    This helper decides: 
    - is the order valid?
    - what is the execution prices?
    - what is the order value?
    - is it filled or pending */
    const executionResult = executeOrder({
      side,
      orderType: type,
      qtyNumber,
      limitPriceNumber,
      snapshot,
      account,
      existingPosition,
    });

    // If trading logic rejects the order, stop and return the error
    if (!executionResult.ok) {
      return res.status(executionResult.statusCode).json({ error: executionResult.error });
    }
    // If success, return
    const { executionPrice, orderValue, status } = executionResult;

    /* BUILD THE FINAL ORDER DOCUMENT
    - now: one shared timestamp for this submit event
    - id: unique order id
    - buildOrderDoc turns raw submit into final OrderDoc shape */
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

    /* PERSIST THE ORDER ITSELF */
    await orders.insertOne(order);

    /* FILLED BUY SIDE EFFECTS
    If buy fills immediately
    - subtract cash 
    - update or create the position */
    if (status === "filled" && side === "buy") {
      // Reduce user's cash by order value
      await accounts.updateOne(
        { uid },
        {
          $inc: { cash: -orderValue },
          $set: { updatedAt: now },
        },
      );
      // If user doesn't have this stock before, create a new position.
      if (existingPosition === null) {
        await positions.insertOne({
          id: new ObjectId().toHexString(),
          uid,
          symbol,
          qty: qtyNumber,
          averageCost: executionPrice,
          createdAt: now,
          updatedAt: now,
        });
      } else {
        // If user already has this stock, update the existing position's qty and average cost.
        const nextQty = existingPosition.qty + qtyNumber;
        const nextAverageCost = (existingPosition.qty * existingPosition.averageCost + qtyNumber * executionPrice) / nextQty;

        await positions.updateOne(
          { uid, symbol },
          {
            $set: {
              qty: nextQty,
              averageCost: nextAverageCost,
              updatedAt: now,
            },
          },
        );
      }
    }

    /* FILLED SELL SIDE EFFECTS
    If a sell fills immediately
    - add cash 
    - reduce or delete the position */
    if (status === "filled" && side === "sell") {
      await accounts.updateOne(
        { uid },
        {
          $inc: { cash: orderValue },
          $set: { updatedAt: now },
        },
      );

      /* Since executeOrder already validated sell quantity
          Existing position is safe to use here */
      const remainingQty = existingPosition!.qty - qtyNumber;

      // If user sold all remaining shares, remove the position entirely
      if (remainingQty === 0) {
        await positions.deleteOne({ uid, symbol });
        // Otherwise, keep the position and just reduce qty
      } else {
        await positions.updateOne(
          { uid, symbol },
          {
            $set: {
              qty: remainingQty,
              updatedAt: now,
            },
          },
        );
      }
    }

    /* Determine activity type based on order status 
      Create a different id for activity */
    const activityType: ActivityType = order.status === "filled" ? "filled" : "submitted";
    const activityId = new ObjectId().toHexString();

    /* BUILD ACTIVITY DOCUMENT */
    const activity = buildActivityDoc({
      id: activityId,
      uid,
      orderId: order.id,
      symbol,
      side,
      qty: qtyNumber,
      type: activityType,
      executionPrice: order.status === "filled" ? executionPrice : null,
      now,
    });

    /* PERSIST ACTIVITY DOCUMENT */
    await activities.insertOne(activity);

    /* SUCCESS RESPONSE
    For now, return the created order */
    return res.status(200).json({
      ok: true,
      order,
    });
    // Any DB/Provider failures lands here
  } catch (err) {
    return res.status(502).json({ error: "Failed to load account or market data" });
  }
}
