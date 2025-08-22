import { Router } from "express";
import { requireFirebase } from "../middleware/requireFirebase";

export const me = Router();

me.get("/", requireFirebase, (req, res) => {
  res.json({ uid: req.uid });
});
