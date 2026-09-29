import { useQuery } from '@tanstack/react-query';
import { getPortfolio } from '@/features/trading/api';
import { useAuth } from "@/hooks/useAuth";

export function usePortfolio() {

 const { user } = useAuth();

  const portfolioQuery = useQuery({
    queryKey: ['portfolio', user?.uid],
    queryFn: getPortfolio,
    enabled: !!user,
    staleTime: 60_000,
  });

  return {
    portfolio: portfolioQuery.data ?? null,
    portfolioLoading: portfolioQuery.isLoading,
    portfolioError: portfolioQuery.error ? 'Failed to load portfolio' : null,
  };
}
