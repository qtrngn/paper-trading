import { Link } from 'react-router-dom';
import { usePortfolio } from '@/hooks/usePortfolio';
import { useAuth } from '@/hooks/useAuth';
import { formatPrice } from '@/lib/formatters';
import { Button } from '@/components/ui/button';

function formatSignedPrice(value: number) {
  return value > 0 ? `+${formatPrice(value)}` : formatPrice(value);
}

export default function HomePage() {
  const { portfolio, portfolioLoading, portfolioError } = usePortfolio();
  const { user, logout } = useAuth();

  if (portfolioLoading) {
    return <main className="page-state">Loading portfolio...</main>;
  }

  if (portfolioError) {
    return <main className="page-state page-state-error">{portfolioError}</main>;
  }

  if (!portfolio) {
    return <main className="page-state">No portfolio data available.</main>;
  }

  const accountValueDisplay =
    portfolio.summary.equity === null
      ? 'Unavailable'
      : formatPrice(portfolio.summary.equity);
  const cashDisplay = formatPrice(portfolio.summary.cash);
  const investmentsDisplay =
    portfolio.summary.marketValue === null
      ? 'Unavailable'
      : formatPrice(portfolio.summary.marketValue);
  const currentHour = new Date().getHours();
  const greeting =
    currentHour < 12
      ? 'Good morning'
      : currentHour < 18
        ? 'Good afternoon'
        : 'Good evening';
  const displayName =
    user?.displayName?.trim() || user?.email?.split('@')[0] || 'Trader';

  return (
    <main className="app-page min-h-screen">
      <div className="flex min-h-screen w-full flex-col gap-6">
        <header className="flex items-center justify-between">
          <h1 className="card-title-lg">
            {greeting}, {displayName}
          </h1>
          <Button onClick={() => void logout()} className="rounded-full">
            Sign out
          </Button>
        </header>

        <div className="home-dashboard-grid">
          <div className="min-w-0 space-y-6">
            <section className="portfolio-hero">
              <p className="label-text">Portfolio value</p>
              <h2 className="number-text mt-2 text-4xl font-semibold tracking-tight sm:text-5xl">
                {accountValueDisplay}
              </h2>

              <div className="portfolio-history-placeholder">
                <div className="space-y-2">
                  <p className="card-title">Portfolio history</p>
                  <p className="body-text-sm">
                    Your account value chart will appear here after portfolio
                    history is added.
                  </p>
                </div>
              </div>
            </section>

            <div className="portfolio-summary-grid">
              <section className="portfolio-summary-card">
                <p className="label-text">Cash balance</p>
                <p className="number-text mt-2 text-2xl font-semibold tracking-tight">
                  {cashDisplay}
                </p>
              </section>

              <section className="portfolio-summary-card">
                <p className="label-text">Investments</p>
                <p className="number-text mt-2 text-2xl font-semibold tracking-tight">
                  {investmentsDisplay}
                </p>
              </section>
            </div>
          </div>

          <aside className="holdings-panel">
            <div className="flex items-center justify-between gap-4">
              <h2 className="card-title-lg">Holdings</h2>
              <span className="caption-text">
                {portfolio.positions.length}{' '}
                {portfolio.positions.length === 1 ? 'position' : 'positions'}
              </span>
            </div>

            {portfolio.positions.length === 0 && (
              <p className="body-text-sm mt-6">No holdings yet.</p>
            )}

            {portfolio.positions.length > 0 && (
              <div className="mt-4">
                {portfolio.positions.map((position) => {
                  const marketValueDisplay =
                    position.marketValue === null
                      ? 'Unavailable'
                      : formatPrice(position.marketValue);
                  const profitLoss = position.unrealizedProfitLoss;
                  const profitLossPercent =
                    position.unrealizedProfitLossPercent;
                  let returnClass = 'text-neutral-status';
                  let returnDisplay = 'Return unavailable';

                  if (profitLoss !== null && profitLossPercent !== null) {
                    returnClass =
                      profitLoss > 0
                        ? 'text-positive'
                        : profitLoss < 0
                          ? 'text-negative'
                          : 'text-neutral-status';
                    returnDisplay = `${formatSignedPrice(profitLoss)} (${profitLossPercent > 0 ? '+' : ''}${profitLossPercent.toFixed(2)}%)`;
                  }

                  return (
                    <Link
                      key={position.symbol}
                      to={`/stocks/${position.symbol}`}
                      className="holding-row"
                    >
                      <span className="min-w-0">
                        <span className="value-text-sm block">
                          {position.symbol}
                        </span>
                        <span className="caption-text block">
                          {position.quantity} shares
                        </span>
                      </span>

                      <span className="shrink-0 text-right">
                        <span className="number-text block text-sm font-semibold">
                          {marketValueDisplay}
                        </span>
                        <span className={`${returnClass} block text-xs`}>
                          {returnDisplay}
                        </span>
                      </span>
                    </Link>
                  );
                })}
              </div>
            )}
          </aside>
        </div>
      </div>
    </main>
  );
}
