import { StockSnapshotResponse } from './../market/snapshot';
import { AccountDoc } from "../trading/account";
import type { PositionDoc } from "../trading/position";


type ExecuteOrderInput = {
  side: "buy" | "sell";
  orderType: "market" | "limit";
  qtyNumber: number;
  limitPriceNumber: number;
  snapshot: StockSnapshotResponse;
  account: AccountDoc;
  existingPosition: PositionDoc | null;
};

type ExecuteOrderResult = | { ok: false; statusCode: 400; error: string } | {
      ok: true;
      executionPrice: number;
      orderValue: number;
      status: "filled" | "pending";
    };


export function executeOrder({ side, orderType, qtyNumber, limitPriceNumber, snapshot, account, existingPosition }:ExecuteOrderInput): ExecuteOrderResult {

    // MARKET GUARDS
  if (side === "buy" && snapshot.ask === null) {
    return { ok: false, statusCode: 400, error: "No available ask price for purchase" };
  }

  if (side === "sell" && snapshot.bid === null) {
    return { ok: false, statusCode: 400, error: "No available bid price for sale" };
  }

  if (side === "sell" && existingPosition === null) {
    return { ok: false, statusCode: 400, error: "No existing position for sale" };
  }

  if (side === "sell" && existingPosition!.qty < qtyNumber ) {
    return { ok: false, statusCode: 400, error: "Insufficient position quantity for sale" };
  }

  // DERIVED TRADING VALUES
  const executionPrice = side === "buy" ? snapshot.ask! : snapshot.bid!;
  const orderValue = executionPrice * qtyNumber;

  // BUSINESS RULES CHECK
  if (side === "buy" && orderValue > account.cash) {
    return { ok: false, statusCode: 400, error: "Insufficient funds for purchase" };
  }

  let status: "filled" | "pending" = "filled";
  if (orderType === "limit") {
    if (side === "buy" && executionPrice > limitPriceNumber) {
      status = "pending";
    }
    if (side === "sell" && executionPrice < limitPriceNumber) {
      status = "pending";
    }
  }
  return {
    ok: true,
    executionPrice,
    orderValue,
    status,
  };
}



