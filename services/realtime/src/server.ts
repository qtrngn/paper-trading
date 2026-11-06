import 'dotenv/config';
import { createServer } from 'node:http';
import { WebSocketServer, WebSocket } from 'ws';
import { unsubscribeFromSymbol } from './alpacaClient.js';
import type { QuoteUpdate, TradeUpdate, SymbolSubscriptionRequest, BarUpdate } from './_types.js';
import { createMarketConnection } from './marketConnection.js';

const MAX_MESSAGE_BYTES = 4 * 1024;
const port = Number(process.env.PORT || '8080');

const server = createServer((_req, res) => {
  res.writeHead(200, { 'Content-Type': 'text/plain' });
  res.end('Realtime service is running');
});

const webSocketServer = new WebSocketServer({ server, maxPayload: MAX_MESSAGE_BYTES });
const subscribersBySymbol = new Map<string, Set<WebSocket>>();
const marketConnection = createMarketConnection(() => Array.from(subscribersBySymbol.keys()), {
  onQuote: handleQuoteUpdate,
  onTrade: handleTradeUpdate,
  onBar: (bar) => handleBarUpdate(bar, 'bar'),
  onUpdatedBar: (bar) => handleBarUpdate(bar, 'updatedBar'),
});

function addSubscriber(symbol: string, socket: WebSocket) {
  let subscribers = subscribersBySymbol.get(symbol);
  if (!subscribers) {
    subscribers = new Set<WebSocket>();
    subscribersBySymbol.set(symbol, subscribers);
  }
  const isFirstSubscriber = subscribers.size === 0;
  subscribers.add(socket);

  if (isFirstSubscriber) {
    marketConnection.handleSubscriptionsChanged();
  }
}

function removeSubscriberFromAllSymbols(socket: WebSocket): void {
  for (const [symbol, subscribers] of subscribersBySymbol) {
    const wasRemoved = subscribers.delete(socket);

    if (wasRemoved && subscribers.size === 0) {
      subscribersBySymbol.delete(symbol);
      unsubscribeFromSymbol(symbol);
    }
  }

  if (subscribersBySymbol.size === 0) {
    marketConnection.handleSubscriptionsChanged();
  }
}

function isSubscriptionRequest(value: unknown): value is SymbolSubscriptionRequest {
  if (typeof value !== 'object' || value === null) {
    return false;
  }
  if (!('type' in value) || !('symbol' in value)) {
    return false;
  }
  return value.type === 'subscribe' && typeof value.symbol === 'string';
}
const TICKER_PATTERN = /^[A-Z]{1,5}(\.[A-Z]{1,2})?$/;

function normalizeSymbol(rawSymbol: string): string | null {
  const symbol = rawSymbol.trim().toUpperCase();
  return TICKER_PATTERN.test(symbol) ? symbol : null;
}

webSocketServer.on('connection', (socket) => {
  socket.on('message', (data) => {
    let subscriptionRequest: unknown;
    try {
      subscriptionRequest = JSON.parse(data.toString());
    } catch {
      console.warn('ignored invalid message');
      return;
    }
    if (!isSubscriptionRequest(subscriptionRequest)) {
      console.warn('ignored message with unexpected shape');
      return;
    }
    const symbol = normalizeSymbol(subscriptionRequest.symbol);
    if (symbol === null) {
      console.warn('ignored invalid symbol');
      return;
    }
    addSubscriber(symbol, socket);
  });
  socket.on('close', () => {
    removeSubscriberFromAllSymbols(socket);
  });
  socket.on('error', (error) => {
    console.error('WebSocket error:', error);
  });
});

function handleQuoteUpdate(quote: QuoteUpdate): void {
  const subscribers = subscribersBySymbol.get(quote.symbol);
  if (!subscribers) {
    return;
  }
  console.log(quote);
  const quoteMessage = {
    type: 'quote',
    data: quote,
  };
  const serializedQuoteMessage = JSON.stringify(quoteMessage);
  subscribers.forEach((browserClient) => {
    if (browserClient.readyState === WebSocket.OPEN) {
      // console.log("sending quote to browser")
      browserClient.send(serializedQuoteMessage);
    }
  });
}

function handleTradeUpdate(trade: TradeUpdate): void {
  const subscribers = subscribersBySymbol.get(trade.symbol);
  if (!subscribers) {
    return;
  }
  console.log(trade);
  const tradeMessage = {
    type: 'trade',
    data: trade,
  };
  const serializedTradeMessage = JSON.stringify(tradeMessage);
  subscribers.forEach((browserClient) => {
    if (browserClient.readyState === WebSocket.OPEN) {
      browserClient.send(serializedTradeMessage);
    }
  });
}

function handleBarUpdate(bar: BarUpdate, type: 'bar' | 'updatedBar'): void {
  const subscribers = subscribersBySymbol.get(bar.symbol);
  if (!subscribers) {
    return;
  }
  const barMessage = {
    type,
    data: bar,
  };
  const serializedBarMessage = JSON.stringify(barMessage);
  subscribers.forEach((browserClient) => {
    if (browserClient.readyState === WebSocket.OPEN) {
      browserClient.send(serializedBarMessage);
    }
  });
}

export async function startServer() {
  server.listen(port, () => {
    console.log(`Server started on ${port}`);
  });
}
startServer().catch((error) => {
  console.error('Failed to start server:', error);
  process.exit(1);
});
