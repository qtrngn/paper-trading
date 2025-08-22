import type { Request, Response, NextFunction } from "express";
import { auth } from "../firebase";

declare global {
  namespace Express {
    interface Request { uid?: string }
  }
}

export async function requireFirebase(req: Request, res: Response, next: NextFunction) {
  try {
    const h = req.header("Authorization") || "";
    const token = h.startsWith("Bearer ") ? h.slice(7) : "";
    if (!token) return res.status(401).send("missing bearer token");

    const decoded = await auth.verifyIdToken(token);
    req.uid = decoded.uid;
    next();
  } catch {
    res.status(401).send("unauthorized");
  }
}
