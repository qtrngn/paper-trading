import { useQuery } from '@tanstack/react-query';
import { getPortfolioHistory } from '@/features/trading/api';
import { useAuth } from '@/hooks/useAuth';

export function usePortfolioHistory() {
  const { user } = useAuth();

  const historyQuery = useQuery({
    queryKey: ['portfolioHistory', user?.uid],
    queryFn: getPortfolioHistory,
    enabled: !!user,
    staleTime: 60_000,
  });

  return {
    historyPoints: historyQuery.data ?? [],
    historyLoading: historyQuery.isLoading,
    historyError: historyQuery.error ? 'Failed to load portfolio history' : null,
  };
}
