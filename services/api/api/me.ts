import { requireUid } from "./_lib/requireUid";

export default async function handler(req: any, res: any) {
  if (req.method === "OPTIONS") {
    return res.status(204).end();
  }

  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const uid = await requireUid(req);
    return res.status(200).json({ uid });
  } catch (err: any) {
    // Keep endpoints clean in production
    if (process.env.NODE_ENV !== "production") {
      console.error("Auth Error in /api/me:", err);
    }
    return res.status(401).json({ error: "Unauthorized" });
  }
}


