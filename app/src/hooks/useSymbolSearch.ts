import { useState } from "react";

export function useSymbolSearch() {
    // STATES
    const [query, setQuery] = useState("");

    const submit = () => {
        const symbol = query.trim().toUpperCase();

        if (!symbol) {
            return;
        }
        return symbol;

    }

    return { query, setQuery, submit }
}