import { api } from "@/lib/api";
import type { Quote, Bar } from "./types";


type GetQuoteResponse = {
    quote: Quote;
    symbol: string;
}

type GetBarsResponse = {
    bars: Bar[];
    symbol: string;
    range: string;
    timeframe: string;
}


// API FOR QUOTE
export async function getQuote(idToken: string, symbol: string): Promise<Quote> {
    const response = await api.get<GetQuoteResponse>("/api/market/quote", {
        headers: { Authorization: `Bearer ${idToken}` },
        params: { symbol }
    });
    return response.data.quote;
}

// API FOR BAR
export async function getBars(idToken: string, symbol: string, range: string): Promise<Bar[]> {
    const response = await api.get<GetBarsResponse>("/api/market/bars", {
        headers: { Authorization: `Bearer ${idToken}` },
        params: { symbol, range }

    });
    return response.data.bars;
}
