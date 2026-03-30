import { useQuery } from "@tanstack/react-query";
import { getSearchSuggestions } from "@/features/market/api";


export function useSearchSuggestions(searchQuery: string) {
    const trimmedQuery = searchQuery.trim();
    const suggestionsQuery = useQuery({
        queryKey: ["searchSuggestions", trimmedQuery],
        queryFn: async ({signal}) => {
            if (trimmedQuery.length < 2) {
                return [];
            }
            return getSearchSuggestions(trimmedQuery, signal)
        },
        enabled: trimmedQuery.length >= 2,
        staleTime: 30_000,
    })
    return {
        suggestions: suggestionsQuery.data ?? [],
        suggestionsLoading: suggestionsQuery.isFetching,
        suggestionsError: suggestionsQuery.error ? 'Failed to load search suggestions' : null,
    }
}