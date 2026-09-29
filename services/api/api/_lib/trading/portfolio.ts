import { getStockSnapshots } from '../market/snapshot';
import { getOrCreateAccount } from './account';
import { getPositionsByUser, type PositionDoc } from './position';

export type PortfolioPosition = {
  symbol: string;
  quantity: number;
  averageCost: number;
  currentPrice: number | null;
  marketValue: number | null;
  costBasis: number;
  unrealizedProfitLoss: number | null;
  unrealizedProfitLossPercent: number | null;
};

export type PortfolioSummary = {
  cash: number;
  buyingPower: number;
  marketValue: number | null;
  equity: number | null;
  costBasis: number;
  unrealizedProfitLoss: number | null;
  unrealizedProfitLossPercent: number | null;
};

export type Portfolio = {
  summary: PortfolioSummary;
  positions: PortfolioPosition[];
};

export function buildPortfolioPosition(position: PositionDoc, currentPrice: number | null): PortfolioPosition {
  const costBasis = position.qty * position.averageCost;
  const marketValue = currentPrice === null ? null : position.qty * currentPrice;
  const unrealizedProfitLoss = marketValue === null ? null : marketValue - costBasis;
  let unrealizedProfitLossPercent: number | null;
  if (unrealizedProfitLoss === null) {
    unrealizedProfitLossPercent = null;
  } else if (costBasis === 0) {
    unrealizedProfitLossPercent = 0;
  } else {
    unrealizedProfitLossPercent = (unrealizedProfitLoss / costBasis) * 100;
  }

  return {
    symbol: position.symbol,
    quantity: position.qty,
    averageCost: position.averageCost,
    currentPrice,
    marketValue,
    costBasis,
    unrealizedProfitLoss,
    unrealizedProfitLossPercent,
  };
}

export function buildPortfolioSummary(cash: number, positions: PortfolioPosition[]): PortfolioSummary {
  const hasUnavailablePrices = positions.some((position) => position.marketValue === null);
  const marketValue = hasUnavailablePrices ? null : positions.reduce((total, position) => total + (position.marketValue ?? 0), 0);
  const costBasis = positions.reduce((total, position) => total + position.costBasis, 0);
  const equity = marketValue === null ? null : cash + marketValue;
  const unrealizedProfitLoss = marketValue === null ? null : marketValue - costBasis;
  const unrealizedProfitLossPercent = unrealizedProfitLoss === null ? null : costBasis === 0 ? 0 : (unrealizedProfitLoss / costBasis) * 100;
  return {
    cash,
    buyingPower: cash,
    marketValue,
    equity,
    costBasis,
    unrealizedProfitLoss,
    unrealizedProfitLossPercent,
  };
}

export async function getPortfolio(uid: string): Promise<Portfolio> {
  const [account, storedPositions] = await Promise.all([getOrCreateAccount(uid), getPositionsByUser(uid)]);
  const symbols = storedPositions.map((position) => position.symbol);
  const snapshots = await getStockSnapshots(symbols);
  const positions = storedPositions.map((position) => {
    const currentPrice = snapshots[position.symbol]?.lastSale ?? null;
    return buildPortfolioPosition(position, currentPrice);
  });
  const summary = buildPortfolioSummary(account.cash, positions);
  return { summary, positions }; 
}
