type MarketClock = {
    is_open: boolean;
    next_open: string;
    next_close: string;
}

export async function getMarketClock(): Promise<MarketClock> {
    const keyId = process.env.ALPACA_API_KEY;
    const secret = process.env.ALPACA_API_SECRET_KEY;
    if (!keyId || !secret) {
        throw new Error ("Missing Alpaca credentials")
    }
    const response = await fetch('https://paper-api.alpaca.markets/v2/clock', {
        headers: {
            'APCA-API-KEY-ID': keyId,
            'APCA-API-SECRET-KEY': secret,
        }}
    )
    if (!response.ok) {
        throw new Error(`Failed to fetch market clock: ${response.status}`);
    }

    const clock = await response.json() as MarketClock;
    return clock;
    
}