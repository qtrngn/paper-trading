export type OrderSide = "buy" | "sell"; 

export type OrderType = "market" | "limit";

export type OrderStatus = "pending" | "filled" | "canceled" | "rejected";

export type Order = {
    id: string;
    symbol: string;
    side: OrderSide;
    type: OrderType;
    qty: number;
    limitPrice?: number;
    status: OrderStatus;
    filledQty: number;
    avgFilledPrice?: number;
    rejectReason?: string;
    createdAt: string;
    updatedAt: string;
}

export type Position ={
    symbol: string;
    qty: number;
    avgCost: number;
    marketPrice?: number;
    marketValue?: number;
    unrealizedPlPct?: number;
}

export type Quote = {
    symbol: string;
    last: number;
    change?: number;
    changePct?: number;
    asOf?: string;
}

export type PortfolioSummary = {
    equity?: number;
    cash?: number;
    buyingPower?: number;
    dayPL?: number;
    dayPLPct?: number;
    totalReturn?: number;
    totalReturnPct?: number;
}