import 'dotenv/config';
import { createServer } from 'node:http';
import { WebSocketServer, WebSocket } from 'ws';
import { connectToAlpaca, subscribeToSymbol } from './alpacaClient.js';
import type { QuoteUpdate, TradeUpdate, SymbolSubscriptionRequest } from './_types.js';

const port = Number(process.env.PORT || '8080');

const server = createServer((_req, res) => {
  res.writeHead(200, { 'Content-Type': 'text/plain' });
  res.end('Realtime service is running');
});

const webSocketServer = new WebSocketServer({ server });

webSocketServer.on('connection', (socket) => {
  socket.on('message', (data) => {
    const subscriptionRequest = JSON.parse(data.toString()) as SymbolSubscriptionRequest;
    // console.log(subscriptionRequest);
    if (subscriptionRequest.type === 'subscribe') {
      subscribeToSymbol(subscriptionRequest.symbol)
    }

  });
});

function handleQuoteUpdate(quote: QuoteUpdate): void {
  console.log(quote);
  const quoteMessage = {
    type: 'quote',
    data: quote,
  };
  const serializedQuoteMessage = JSON.stringify(quoteMessage);
  webSocketServer.clients.forEach((browserClient) => {
    if (browserClient.readyState === WebSocket.OPEN) {
      // console.log("sending quote to browser")
      browserClient.send(serializedQuoteMessage);
    }
  });
}

function handleTradeUpdate(trade: TradeUpdate): void {
  console.log(trade);
  const tradeMessage = {
    type: 'trade',
    data: trade
  };

  const serializedTradeMessage = JSON.stringify(tradeMessage);
  webSocketServer.clients.forEach((browserClient) => {
    if (browserClient.readyState === WebSocket. OPEN) {
      browserClient.send(serializedTradeMessage);
    }
  })
}


export async function startServer() {
  await connectToAlpaca({onQuote: handleQuoteUpdate, onTrade: handleTradeUpdate});
  server.listen(port, () => {
    console.log(`Server started on ${port}`);
  });
}

startServer().catch((error) => {
  console.error('Failed to start server:', error);
  process.exit(1);
});
