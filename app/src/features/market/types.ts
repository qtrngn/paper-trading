export type Bar = {
  t: string; // timestamp
  o: number; // open
  h: number; // high
  l: number; // low
  c: number; // close
  v: number; // volume
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

export type BarUpdate = Bar & {
   symbol: string;
}

export type TradeMessage = {
   type: "trade";
   data: TradeUpdate;
}

export type BarMessage = {
  type: 'bar' | 'updatedBar' | 'dailyBar';
  data: BarUpdate;
}

export type RealTimeMarketMessage =  QuoteMessage | TradeMessage | BarMessage; 

