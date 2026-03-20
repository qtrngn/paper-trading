import { useState, useEffect, useCallback } from "react";
import { getCurrentUserToken } from "@/lib/auth"; 
import type { Quote } from "@/features/market/types";
import { getQuote } from "@/features/market/api";


export function useStockQuote(symbol: string | null) {
    const [quote, setQuote] = useState<Quote | null>(null);
    const [quoteLoading, setQuoteLoading] = useState(false);
    const [quoteError, setQuoteError] = useState<string | null>(null);

    const fetchQuote = useCallback(async (nextSymbol: string) => {
        setQuoteLoading(true);
        setQuoteError(null);

        try {
            const token = await getCurrentUserToken();
            const data = await getQuote(token, nextSymbol);
            setQuote(data);
            
        } catch {
            setQuote(null);
            setQuoteError("Failed to fetch data")

        } finally {
            setQuoteLoading(false)
        }
    }, []);

    useEffect(() => {
        if (!symbol) {
            setQuote(null);
            setQuoteError(null);
            setQuoteLoading(false);
            return;
        }
        fetchQuote(symbol);
    },[symbol, fetchQuote])


    return { quote, quoteLoading, quoteError }
} 
