import { VercelRequest, VercelResponse } from "@vercel/node";

export function requireMethod(req: VercelRequest, res: VercelResponse, method: string): boolean {
    if (req.method !== method) {
        res.status(405).json({ error: "Method is not allowed" });
        return false;
    }
    return true;
}