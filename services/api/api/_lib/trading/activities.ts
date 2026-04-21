/* 
TODO:
Step1: To create activity, what information do I already have as a raw input shape 
Step2: What is the final stored shape in the database (mongodb)
Step3: Create a builder to turn the raw input into the final stored shape. */

// Define the raw input shape (minimum facts needed for the builder)
export type BuildActivityInput = {
  id: string;
  uid: string;
  orderId: string;
  symbol: string;
  side: "buy" | "sell";
  qty: number;
  type: ActivityType;
  executionPrice: number | null;
  now: Date;
};

export type ActivityType = "filled" | "submitted";

// Define the final stored shape in the database (mongodb)
export type ActivityDoc = {
  id: string;
  uid: string;
  type: ActivityType;
  symbol: string;
  side: "buy" | "sell";
  qty: number;
  price: number | null;
  orderId: string;
  message: string;
  createdAt: Date;
};

// Create a builder to turn the raw input into the final stored shape
export function buildActivityDoc(input: BuildActivityInput): ActivityDoc {
  const { id, uid, orderId, symbol, side, qty, type, executionPrice, now } = input;
  return {
    id,
    uid,
    type,
    symbol,
    side,
    qty,
    price: type === "filled" ? executionPrice : null,
    orderId,
    message: type === "filled" ? "Your order has been filled" : "Your order has been submitted",
    createdAt: now,
  };
}
