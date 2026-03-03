import { useState } from "react";

export function useSymbolSearch() {
    // STATES
    const [query, setQuery] = useState("");
    const [selectedSymbol, setSelectedSymbol] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    const submit = () => {

        const symbol = query.trim().toUpperCase();

        if (!symbol) {
            return;
        }
        setSelectedSymbol(symbol);
    }

    return { query, setQuery, selectedSymbol, loading, submit}
}