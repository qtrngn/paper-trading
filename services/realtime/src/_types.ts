export type QuoteUpdate = {
  symbol: string;
  bidPrice: number;
  askPrice: number;
  timestamp: string;
};

export type TradeUpdate = {
  symbol: string;
  price: number;
  size: number;
  timestamp: string;  
}

export type SymbolSubscriptionRequest = {
  type: 'subscribe';
  symbol: string;
}