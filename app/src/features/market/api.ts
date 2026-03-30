import { api } from "@/lib/api";
import type { Quote, Bar, SearchSuggestions } from "./types";


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

type GetSearchSuggestionsResponse = {
    suggestions: SearchSuggestions[];
  };

// API FOR QUOTE
export async function getQuote(symbol: string): Promise<Quote> {
    const response = await api.get<GetQuoteResponse>("/api/market/quote", {
        params: { symbol }
    });
    return response.data.quote;
}

// API FOR BAR
export async function getBars(symbol: string, range: string): Promise<Bar[]> {
    const response = await api.get<GetBarsResponse>("/api/market/bars", {
        params: { symbol, range }

    });
    return response.data.bars;
}

// API FOR SEARCH
export async function getSearchSuggestions(query: string, signal: AbortSignal): Promise<SearchSuggestions[]> {
    const response = await api.get<GetSearchSuggestionsResponse>("/api/market/search", {
        params: {q: query},
        signal
    })
    return response.data.suggestions; 
}


