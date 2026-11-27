export type Bar = {
  t: string; // timestamp
  o: number; // open
  h: number; // high
  l: number; // low
  c: number; // close
  v: number; // volume
};

// Trading session a 1D chart covers (ISO timestamps)
export type ChartSession = {
  open: string;
  close: string;
};

export type Quote = {
  bp: number; // bid price
  bs: number; // bid size
  ap: number; // ask price
  as: number; // ask size
  t: string; // timestamp
};

export type SearchSuggestions = {
  symbol: string;
  name: string;
};

export type SnapshotResponse = {
  symbol: string;
  name: string | null; // company name, null if it couldn't be loaded
  open: number | null;
  high: number | null;
  low: number | null;
  volume: number | null;
  bid: number | null;
  ask: number | null;
  lastSale: number | null;
};

export type QuoteUpdate = {
  symbol: string;
  bidPrice: number;
  askPrice: number;
  timestamp: string;
};

export type QuoteMessage = {
    type: "quote";
    data: QuoteUpdate;
}

export type  SymbolSubscriptionRequest = {
    type: "subscribe";
    symbol: string;
}

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

export type TradeMessage = {
   type: "trade";
   data: TradeUpdate;
}

export type BarMessage = {
  type: 'bar' | 'updatedBar';
  data: BarUpdate;
}

export type RealTimeMarketMessage =  QuoteMessage | TradeMessage | BarMessage; 

export type ChartPoint = {
  price: number;
  time: string;
}  