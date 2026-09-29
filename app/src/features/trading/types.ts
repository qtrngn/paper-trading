export type OrderSide = "buy" | "sell"; 

export type OrderType = "market" | "limit";

export type OrderStatus = "pending" | "filled" | "cancelled" | "rejected";

export type Order = {
  id: string;
  symbol: string;
  side: OrderSide;
  type: OrderType;
  qty: number;
  limitPrice: number | null;
  status: OrderStatus;
  submittedAt: string;
  filledAt: string | null;
  fillPrice: number | null;
  createdAt: string;
  updatedAt: string;
};

export type PortfolioPosition = {
  symbol: string;
  quantity: number;
  averageCost: number;
  currentPrice: number | null;
  marketValue: number | null;
  costBasis: number;
  unrealizedProfitLoss: number | null;
  unrealizedProfitLossPercent: number | null;
};

export type PortfolioSummary = {
  cash: number;
  buyingPower: number;
  marketValue: number | null;
  equity: number | null;
  costBasis: number;
  unrealizedProfitLoss: number | null;
  unrealizedProfitLossPercent: number | null;
};

export type Portfolio = {
  summary: PortfolioSummary;
  positions: PortfolioPosition[];
};

export type QuoteView = {
    symbol: string;
    last: number;
    change?: number;
    changePct?: number;
    asOf?: string;
};