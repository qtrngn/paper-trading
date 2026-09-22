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

export type BarUpdate = {
  symbol: string;
  timestamp: string; 
  open: number; 
  high: number; 
  low: number; 
  close: number; 
  volume: number; 
}

export type SymbolSubscriptionRequest = {
  type: 'subscribe';
  symbol: string;
}