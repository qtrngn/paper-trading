import { signOut } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { usePortfolio } from '@/hooks/usePortfolio';
import { formatPrice } from '@/lib/formatters';
import { Button } from '@/components/ui/button';

export default function HomePage() {
  const { portfolio, portfolioLoading, portfolioError } = usePortfolio();

  if (portfolioLoading) {
    return <main className="page-state">Loading portfolio...</main>;
  }

  if (portfolioError) {
    return <main className="page-state page-state-error">{portfolioError}</main>;
  }

  if (!portfolio) {
    return <main className="page-state">No portfolio data available.</main>;
  }

  const cashDisplay = formatPrice(portfolio.summary.cash);
  const investmentsDisplay =
    portfolio.summary.marketValue === null
      ? 'Unavailable'
      : formatPrice(portfolio.summary.marketValue);

  return (
    <main className="app-page min-h-screen">
      <div className="flex min-h-screen w-full flex-col gap-6">
        <header className="flex items-center justify-between">
          <Button onClick={() => signOut(auth)} className="rounded-full">
            Sign out
          </Button>
        </header>
        <section className="rounded-xl bg-surface p-5 shadow-sm">
          <div className="grid grid-cols-1 border-b border-border-soft pb-6 sm:grid-cols-2">
            <section className="pb-6 sm:pb-0 sm:pr-6">
              <h2 className="number-text text-2xl font-semibold tracking-tight sm:text-4xl">
                {cashDisplay}
              </h2>
              <p className="label-text">Cash balance</p>
            </section>

            <section className="border-t border-border-soft pt-6 sm:border-t-0 sm:border-l sm:pt-0 sm:pl-6">
              <h2 className="number-text text-2xl font-semibold tracking-tight sm:text-4xl">
                {investmentsDisplay}
              </h2>
              <p className="label-text">Investments</p>
            </section>
          </div>

          <section className="space-y-4 pt-6">
            <h2 className="card-title-lg">Positions</h2>
            {portfolio.positions.length === 0 && (
              <p className="body-text-sm">No positions yet.</p>
            )}
          </section>
        </section>
      </div>
    </main>
  );
}
