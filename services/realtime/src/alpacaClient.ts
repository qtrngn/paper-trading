import { WebSocket } from 'ws';
import type { RawData } from 'ws';
import type { QuoteUpdate } from './_types.js'; 

const alpacaSocketUrl = 'wss://stream.data.alpaca.markets/v2/iex';
let alpacaSocket: WebSocket | undefined;

// CONNECT TO ALPACA / AUTHENTICATION
export async function connectToAlpaca() {
  const keyId = process.env.ALPACA_API_KEY;
  const secret = process.env.ALPACA_API_SECRET_KEY;

  if (!keyId || !secret) {
    throw new Error('Missing Alpaca credentials');
  }

  await new Promise<void>((resolve, reject) => {
    const socket = new WebSocket(alpacaSocketUrl);
    alpacaSocket = socket;

    // timeout
    const authTimeout = setTimeout(() => {
      reject(new Error('Alpaca authentication timed out'));
      socket.terminate();
    }, 10_000);

    // HANDLES
    function handleAlpacaOpen() {
      console.log('Connected to Alpaca.');

      const authMessage = {
        action: 'auth',
        key: keyId,
        secret: secret,
      };
      const serializedAuthMessage = JSON.stringify(authMessage);
      socket.send(serializedAuthMessage);
    }

    function handleAlpacaMessage(data: RawData) {
      const message = String(data);
      try {
        const parsedMessages = JSON.parse(message);
        for (const alpacaMessage of parsedMessages) {
          console.log('Received from Alpaca:', alpacaMessage);
          // success/authenticated message
          if (alpacaMessage.T === 'success' && alpacaMessage.msg === 'authenticated') {
            clearTimeout(authTimeout);
            resolve();
            return;
            // subscription check
          } else if (alpacaMessage.T === 'subscription') {
            console.log('Alpaca subscription confirmed:', alpacaMessage);
            continue;
            // quote check
          } else if (alpacaMessage.T === 'q') {
            console.log('Quote received:', {
              // symbol: alpacaMessage.S,
              // bidPrice: alpacaMessage.bp,
              // askPrice: alpacaMessage.ap,
              // timestamp: alpacaMessage.t,
            });
            continue;
            // error message
          } else if (alpacaMessage.T === 'error') {
            clearTimeout(authTimeout);
            reject(new Error(`Alpaca error ${alpacaMessage.code}: ${alpacaMessage.msg}`));
            return;
          }
        }
      } catch {
        clearTimeout(authTimeout);
        reject(new Error('Alpaca message cannot be parsed'));
        return;
      }
    }

    // connection error
    socket.on('error', (error) => {
      reject(error);
    });
    // else
    socket.on('close', () => {
      clearTimeout(authTimeout);
      reject(new Error('Alpaca WebSocket closed before authentication completed'));
    });
    socket.on('open', handleAlpacaOpen);
    socket.on('message', handleAlpacaMessage);
  });
}

// SUBSCRIBE/UNSUBSCRIBE SYMBOL
export function subscribeToSymbol(symbol: string): void {
  if (!alpacaSocket) {
    throw new Error("Alpaca connection hasn't been created");
  }
  if (alpacaSocket.readyState === WebSocket.OPEN) {
    const subscription = {
      action: 'subscribe',
      trades: [symbol],
      quotes: [symbol],
      bars: [symbol],
      updatedBars: [symbol],
    };
    const serializedSubscriptionRequest = JSON.stringify(subscription);
    alpacaSocket.send(serializedSubscriptionRequest);
  }
}
