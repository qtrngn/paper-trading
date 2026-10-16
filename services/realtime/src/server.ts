import 'dotenv/config';
import { createServer } from 'node:http';
import { WebSocketServer, WebSocket } from 'ws';
import { connectToAlpaca, subscribeToSymbol, unsubscribeFromSymbol } from './alpacaClient.js';
import type { QuoteUpdate, TradeUpdate, SymbolSubscriptionRequest, BarUpdate } from './_types.js';

const port = Number(process.env.PORT || '8080');

const server = createServer((_req, res) => {
  res.writeHead(200, { 'Content-Type': 'text/plain' });
  res.end('Realtime service is running');
});

const webSocketServer = new WebSocketServer({ server });
const subscribersBySymbol = new Map<string, Set<WebSocket>>();

function addSubscriber(symbol:string, socket: WebSocket) {
  const normalizedSymbol = symbol.trim().toUpperCase();
  let subscribers = subscribersBySymbol.get(normalizedSymbol);
  if (!subscribers) {
    subscribers = new Set<WebSocket>();
    subscribersBySymbol.set(normalizedSymbol, subscribers)
  }
  const isFirstSubscriber = subscribers.size === 0;
  subscribers.add(socket);
  if (isFirstSubscriber) {
    subscribeToSymbol(normalizedSymbol);
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
}

webSocketServer.on('connection', (socket) => {
  socket.on('message', (data) => {
    const subscriptionRequest = JSON.parse(data.toString()) as SymbolSubscriptionRequest;
    // console.log(subscriptionRequest);
    if (subscriptionRequest.type === 'subscribe') {
      addSubscriber(subscriptionRequest.symbol, socket)
    }
  });
  socket.on('close',() => { removeSubscriberFromAllSymbols(socket)});
});

function handleQuoteUpdate(quote: QuoteUpdate): void {
  const subscribers = subscribersBySymbol.get(quote.symbol)
  if (!subscribers) {return}
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
  if (!subscribers) {return}
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
  if (!subscribers) {return}
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
  await connectToAlpaca({ onQuote: handleQuoteUpdate, onTrade: handleTradeUpdate, onBar:(bar) => handleBarUpdate(bar, 'bar'), onUpdatedBar: (bar) => handleBarUpdate(bar, 'updatedBar')  });
  server.listen(port, () => {
    console.log(`Server started on ${port}`);
  });
}

startServer().catch((error) => {
  console.error('Failed to start server:', error);
  process.exit(1);
});
