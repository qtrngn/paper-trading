import type { VercelRequest, VercelResponse } from "@vercel/node"; 
import { requireUid } from "../_lib/requireUid";


 export default async function handler(req:VercelRequest, res:VercelResponse) {
    // METHOD GUARD
    if (req.method !== "GET") {
        return res.status(405).json({error: "Method is not allowed"})
    } 
    let uid: string;
    try {
        uid = await requireUid(req);
    } catch (err) {
        const message = err instanceof Error ? err.message : "unauthorize";
        return res.status(401).json({error: "unauthorized", message})
    }
  

   // SYMBOL VALIDATION
   const raw = req.query.symbol
   const value = Array.isArray(raw) ? (raw[0] ?? "") : (raw ?? "");
   const symbol = String(value).trim().toUpperCase();
   const isValid = /^[A-Z0-9.\-]{1,10}$/.test(symbol);
   
   if (!isValid) {
    return res.status(400).json({ error: "Missing or invalid symbol"})
   }
   // CREDENTIALS VALIDATION
   const keyId = process.env.ALPACA_API_KEY; 
   const secret = process.env.ALPACA_API_SECRET_KEY;

   if (!keyId || !secret) return res.status(500).json({error: "Missing Alpaca credentials"})

    // ALPACA API CALL
    const baseUrl = process.env.ALPACA_BASE_URL;
    const url = new URL(`${baseUrl}/stocks/${encodeURIComponent(symbol)}/quotes/latest?feed=iex`)

    const headers: Record<string, string> = {
        "APCA-API-KEY-ID": keyId,
        "APCA-API-SECRET-KEY": secret,
    }

    async function fetchQuote(u:URL, h: Record<string, string>) {
      
        const response = await fetch(u, {headers: h});
        
        if (!response.ok) {
            const body = await response.text();
            throw new Error (`Alpaca ${response.status}: ${body.slice(0,100)}`)
        }
        return await response.json();
     }
     try {
        const data = await fetchQuote(url, headers);
        res.setHeader("Cache-Control", "no-store");
        return res.status(200).json(data);
     } catch (error) {
        const message = error instanceof Error ? error.message : "unknown_error";
        return res.status(502).json({error: "Alpaca_quote_failed", message})
     }
     

 } 


