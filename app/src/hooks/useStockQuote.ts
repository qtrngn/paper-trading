import { useState, useEffect, useCallback } from "react";
import { auth } from "@/lib/firebase";
import type { Quote } from "@/features/market/types";
import { getQuote } from "@/features/market/api";


export function useStockQuote(symbol: string | null) {
    const [quote, setQuote] = useState<Quote | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchQuote = useCallback(async (nextSymbol: string) => {
        setLoading(true);
        setError(null);

        const user = auth.currentUser;
        if (!user) {
            setError("User not signed in");
            setLoading(false);
            return;
        }

        try {
            const token = await user.getIdToken();
            const data = await getQuote(token, nextSymbol);
            setQuote(data);
            
        } catch {
            setQuote(null);
            setError("Failed to fetch data")

        } finally {
            setLoading(false)
        }
    }, []);

    useEffect(() => {
        if (!symbol) {
            setQuote(null);
            setError(null);
            setLoading(false);
            return;
        }
        fetchQuote(symbol);
    },[symbol, fetchQuote])


    return { quote, loading, error }
} 
