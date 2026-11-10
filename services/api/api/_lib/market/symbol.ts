export const SYMBOL_REGEX =  /^[A-Z0-9.\-]{1,10}$/;


export function normalizeSymbol(value: unknown): string {
    return String(value ?? "").trim().toUpperCase();
  }


export function isValidSymbol(symbol: string): boolean {
    return SYMBOL_REGEX.test(symbol);
}

export function parseSymbol (raw: string): string | null {

  const symbol = normalizeSymbol(raw);
  if (!isValidSymbol(symbol)) {
    return null;
  }
  return symbol;
}