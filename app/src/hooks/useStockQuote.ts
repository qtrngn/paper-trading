import { useQuery } from "@tanstack/react-query";
import { getQuote } from "@/features/market/api";


export function useStockQuote(symbol: string | null) {
   
    const queryKey = ['quote', symbol];
    
    const quoteQuery = useQuery ({
        queryKey: queryKey,
        queryFn: async () => {
            if (!symbol) {
                return null;
            }
            return getQuote(symbol);
        },
        enabled: !!symbol,
    })
    

    return { 
        quote: quoteQuery.data ?? null,
        quoteLoading: quoteQuery.isLoading,
        quoteError: quoteQuery.error ? 'Failed to load quote' : null, 
     }
} 
