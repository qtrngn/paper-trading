import { useEffect, useState, useRef } from 'react';
import type { QuoteUpdate, TradeUpdate, RealTimeMarketMessage, BarUpdate } from '@/features/market/types.ts';

const MAX_LIVE_BARS = 1_000;

type RealtimeMarketDataState = {
  symbol: string | null;
  latestQuote: QuoteUpdate | null;
  latestTrade: TradeUpdate | null;
  liveBars: BarUpdate[];
};

export function useRealtimeMarketData(symbol: string | null) {
  const [marketData, setMarketData] = useState<RealtimeMarketDataState>({
    symbol: null,
    latestQuote: null,
    latestTrade: null,
    liveBars: [],
  });
  const lastQuoteRef = useRef<QuoteUpdate | null>(null);
  const lastTradeRef = useRef<TradeUpdate | null>(null);

  useEffect(() => {
    lastQuoteRef.current = null;
    lastTradeRef.current = null;
    if (symbol === null) {
      return;
    }

    const webSocket = new WebSocket(import.meta.env.VITE_REALTIME_WEBSOCKET_URL);
    webSocket.onopen = () => {
      webSocket.send(JSON.stringify({ type: 'subscribe', symbol: symbol }));
    };

    webSocket.onmessage = (event) => {
      try {
        const parsedMessage: RealTimeMarketMessage = JSON.parse(event.data);
        if (parsedMessage.type === 'quote' && parsedMessage.data.symbol === symbol) {
          lastQuoteRef.current = parsedMessage.data;
        }
        if (parsedMessage.type === 'trade' && parsedMessage.data.symbol === symbol) {
          lastTradeRef.current = parsedMessage.data;
        }
        if ((parsedMessage.type === 'bar' || parsedMessage.type === 'updatedBar') && parsedMessage.data.symbol === symbol) {
          const incomingBar = parsedMessage.data;
          setMarketData((currentData) => {
            const isSameSymbol = currentData.symbol === symbol;
            const currentBars = isSameSymbol ? currentData.liveBars : [];
            const existingIndex = currentBars.findIndex((bar) => bar.timestamp === incomingBar.timestamp);
            const nextBars = [...currentBars];
            if (existingIndex >= 0) {
              nextBars[existingIndex] = incomingBar;
            } else {
              nextBars.push(incomingBar);
            }
            return {
              symbol,
              latestQuote: isSameSymbol ? currentData.latestQuote : null,
              latestTrade: isSameSymbol ? currentData.latestTrade : null,
              liveBars: nextBars.slice(-MAX_LIVE_BARS),
            };
          });
        }
      } catch {
        console.log('Failed to parse realtime WebSocket message');
      }
    };

    const updateInterval = window.setInterval(() => {
      const pendingQuote = lastQuoteRef.current;
      const pendingTrade = lastTradeRef.current;
      if (pendingQuote === null && pendingTrade === null) {
        return;
      }
      lastQuoteRef.current = null;
      lastTradeRef.current = null;

      setMarketData((currentData) => {
        const isSameSymbol = currentData.symbol === symbol;
        return {
          symbol,
          latestQuote: pendingQuote ?? (isSameSymbol ? currentData.latestQuote : null),
          latestTrade: pendingTrade ?? (isSameSymbol ? currentData.latestTrade : null),
          liveBars: isSameSymbol ? currentData.liveBars : [],
        };
      });
    }, 500);

    return () => {
      window.clearInterval(updateInterval);
      webSocket.close();
    };
  }, [symbol]);
  const isCurrentSymbol = marketData.symbol === symbol;
  return {
    latestQuote: isCurrentSymbol ? marketData.latestQuote : null,
    latestTrade: isCurrentSymbol ? marketData.latestTrade : null,
    liveBars: isCurrentSymbol ? marketData.liveBars : [],
  };
}
