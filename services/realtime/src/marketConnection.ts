import { connectToAlpaca, disconnectFromAlpaca, subscribeToSymbol } from './alpacaClient.js';
import { getMarketClock } from './marketClock.js';
import type { RealtimeHandlers } from './alpacaClient.js';

export function createMarketConnection(getSymbols: () => string[], handlers: RealtimeHandlers) {
  let marketTimer: ReturnType<typeof setTimeout> | undefined;
  let idleDisconnectTimer: ReturnType<typeof setTimeout> | undefined;
  const IDLE_DISCONNECT_DELAY_MS = 5_000;
  let isSyncRunning = false;
  let syncRequested = false;

  async function syncMarketConnection(): Promise<void> {
    if (isSyncRunning) {
      syncRequested = true;
      return;
    }

    isSyncRunning = true;

    try {
      if (marketTimer !== undefined) {
        clearTimeout(marketTimer);
        marketTimer = undefined;
      }

      if (getSymbols().length === 0) {
        disconnectFromAlpaca();
        return;
      }

      const clock = await getMarketClock();

      // Subscribers may have left while the clock request was running.
      if (getSymbols().length === 0) {
        disconnectFromAlpaca();
        return;
      }

      const nextCheckAt = clock.is_open ? clock.next_close : clock.next_open;

      const delay = Math.max(Date.parse(nextCheckAt) - Date.now(), 1_000);

      marketTimer = setTimeout(() => {
        syncMarketConnection().catch((error) => {
          console.error('Failed to sync market connection:', error);
        });
      }, delay);

      if (!clock.is_open) {
        disconnectFromAlpaca();
        return;
      }

      await connectToAlpaca(handlers);

      for (const symbol of getSymbols()) {
        subscribeToSymbol(symbol);
      }
    } finally {
      isSyncRunning = false;

      if (syncRequested) {
        syncRequested = false;

        syncMarketConnection().catch((error) => {
          console.error('Failed to sync market connection:', error);
        });
      }
    }
  }

  function handleSubscriptionsChanged(): void {
    const hasSubscribers = getSymbols().length > 0;

    if (hasSubscribers) {
      if (idleDisconnectTimer !== undefined) {
        clearTimeout(idleDisconnectTimer);
        idleDisconnectTimer = undefined;
      }

      syncMarketConnection().catch((error) => {
        console.error('Failed to sync market connection:', error);
      });

      return;
    }

    if (idleDisconnectTimer !== undefined) {
      return;
    }

    idleDisconnectTimer = setTimeout(() => {
      idleDisconnectTimer = undefined;
      if (getSymbols().length === 0) {
        syncMarketConnection().catch((error) => {
          console.error('Failed to sync market connection:', error);
        });
      }
    }, IDLE_DISCONNECT_DELAY_MS);
  }

  return { handleSubscriptionsChanged };
}
