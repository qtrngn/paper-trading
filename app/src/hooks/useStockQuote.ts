import { useState, useEffect, useCallback } from "react";
import { auth } from '@/lib/firebase';

export function useStockQuote(symbol: string | null) {
    const [quote, setQuote] = useState<unknown | null>(null);
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
            const encodedSymbol = encodeURIComponent(nextSymbol);
            const requestUrl = `/api/market/quote?symbol=${encodedSymbol}`;
            const res = await fetch(requestUrl, {
                headers: { Authorization: `Bearer ${token}` },
            });

            if (!res.ok) {
                const message = `Request failed (${res.status})`;
                setQuote(null);
                setError(message);
                return;
            }
            const data = await res.json();
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
