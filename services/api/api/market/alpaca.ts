export function getAlpacaHeaders(): Record<string, string> {
  const keyId = process.env.ALPACA_API_KEY;
  const secret = process.env.ALPACA_API_SECRET_KEY;

  if (!keyId || !secret) {
    throw new Error("Missing Alpaca credentials");
  }

  return {
    "APCA-API-KEY-ID": keyId,
    "APCA-API-SECRET-KEY": secret,
  };
}

export async function fetchAlpacaJson(url: URL, headers: Record<string, string>): Promise<any> {
  const response = await fetch(url, { headers })
  if (!response.ok) {
    const body = await response.text();
    throw new Error(`Alpaca ${response.status}: ${body.slice(0, 100)}`)
  }
  return await response.json()

}

export function getAlpacaBaseUrl(): string {
  const baseUrl = process.env.ALPACA_BASE_URL;

  if (!baseUrl) {
    throw new Error("Missing Alpaca base URL");
  }
  return baseUrl;
}