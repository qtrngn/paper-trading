import { useEffect, useState, useRef } from 'react';
import type { QuoteUpdate, TradeUpdate, RealTimeMarketMessage } from '@/features/market/types.ts';

export function useRealtimeMarketData(symbol: string | null) {
  const [latestQuote, setLatestQuote] = useState<QuoteUpdate | null>(null);
  const [latestTrade, setLatestTrade] = useState<TradeUpdate | null>(null);
  const lastQuoteRef = useRef<QuoteUpdate | null>(null);
  const lastTradeRef = useRef<TradeUpdate | null>(null);

  useEffect(() => {
    if (symbol === null) {
      setLatestQuote(null);
      setLatestTrade(null);
      return;
    }

    setLatestQuote(null);
    setLatestTrade(null);
    lastQuoteRef.current = null;
    lastTradeRef.current = null;

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
      } catch {
        console.log('Failed to parse realtime WebSocket message');
      }
    };

    const updateInterval = window.setInterval(() => {
      if (lastQuoteRef.current) {
        setLatestQuote(lastQuoteRef.current);
      }
      if (lastTradeRef.current) {
        setLatestTrade(lastTradeRef.current);
      }
    }, 500);

    return () => {
      window.clearInterval(updateInterval);
      webSocket.close();
    };
  }, [symbol]);
  return { latestQuote, latestTrade };
}
