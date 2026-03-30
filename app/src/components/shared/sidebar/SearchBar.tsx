import { useEffect, useState, type KeyboardEvent } from "react";
import { useNavigate } from "react-router-dom";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { useDebouncedValue } from "@/hooks/useDebouncedValue";
import { useSearchSuggestions } from "@/hooks/useSearchSuggestions";
import type { SearchSuggestions } from "@/features/market/types";

type SearchBarProps = {
  open: boolean;
  onOpenChange(open: boolean): void;
};

function normalizeSymbol(value: string) {
  return value.trim().toUpperCase();
}

export default function SearchBar({open, onOpenChange,}: SearchBarProps) {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [isListOpen, setIsListOpen] = useState(false);


  const debouncedSearchQuery = useDebouncedValue(searchQuery, 300);
  const { suggestions = [], suggestionsLoading } = useSearchSuggestions(debouncedSearchQuery);

  useEffect(() => {
    if (!open) {
      setSearchQuery("");
      setIsListOpen(false);
    }
  }, [open]);

  // ACTIONS
  function closeSearch() {
    onOpenChange(false);
  }

  // NAVIGATION
  function goToSymbol(symbol: string) {
    const normalizedSymbol = normalizeSymbol(symbol);

    if (!normalizedSymbol) {
      return;
    }

    closeSearch();
    navigate(`/stocks/${normalizedSymbol}`);
  }

  // HANDLERS
  function handleInputChange(nextValue: string) {
    setSearchQuery(nextValue);
    setIsListOpen(nextValue.trim().length > 0);
  }

  function handleInputKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key !== "Enter") {
      return;
    }

    const trimmedQuery = normalizeSymbol(searchQuery);

    if (!trimmedQuery) {
      return;
    }

    if (isListOpen && suggestions.length > 0) {
      return;
    }

    event.preventDefault();
    setIsListOpen(false);
    goToSymbol(trimmedQuery);
  }

  function handleSuggestionSelect(suggestion: SearchSuggestions) {
    setSearchQuery(suggestion.symbol);
    setIsListOpen(false);
    goToSymbol(suggestion.symbol);
  }

  return (
    <CommandDialog open={open} onOpenChange={onOpenChange}>
      <CommandInput
        placeholder="Search symbol or company..."
        value={searchQuery}
        onValueChange={handleInputChange}
        onKeyDown={handleInputKeyDown}
      />

      {isListOpen && (
        <CommandList>
          {suggestionsLoading ? (
            <div className="px-3 py-2 text-sm text-muted-foreground">
              Searching...
            </div>
          ) : suggestions.length === 0 ? (
            <CommandEmpty>No results found.</CommandEmpty>
          ) : (
            <CommandGroup heading="Suggestions">
              {suggestions.map((suggestion) => (
                <CommandItem
                  key={suggestion.symbol}
                  value={`${suggestion.symbol} ${suggestion.name}`}
                  onSelect={() => handleSuggestionSelect(suggestion)}
                >
                  <div className="flex min-w-0 flex-col">
                    <span className="font-medium">{suggestion.symbol}</span>
                    <span className="truncate text-sm text-muted-foreground">
                      {suggestion.name}
                    </span>
                  </div>
                </CommandItem>
              ))}
            </CommandGroup>
          )}
        </CommandList>
      )}
    </CommandDialog>
  );
}