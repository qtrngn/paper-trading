export type OrderSide = "buy" | "sell";
export type OrderType = "market" | "limit";
export type OrderStatus = "pending" | "filled" | "cancelled" | "rejected";

export type OrderDoc = {
  id: string;
  uid: string;
  symbol: string;
  side: OrderSide;
  qty: number;
  type: OrderType;
  limitPrice: number | null;
  status: OrderStatus;
  submittedAt: Date;
  filledAt: Date | null;
  fillPrice: number | null;
  createdAt: Date;
  updatedAt: Date;
};

export type BuildOrderInput = {
  id: string;
  uid: string;
  symbol: string;
  side: OrderSide;
  qty: number;
  type: OrderType;
  limitPrice: number | null;
  status: "filled" | "pending";
  executionPrice: number;
  now: Date;
};

export function buildOrderDoc(input: BuildOrderInput): OrderDoc {
  const { id, uid, symbol, side, qty, type, limitPrice, status, executionPrice, now } = input;
  return {
    id,
    uid,
    symbol,
    side,
    qty,
    type,
    limitPrice,
    status,
    submittedAt: now,
    filledAt: status === "filled" ? now : null,
    fillPrice: status === "filled" ? executionPrice : null,
    createdAt: now,
    updatedAt: now,
  };
}
