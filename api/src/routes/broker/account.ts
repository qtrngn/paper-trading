import { Router } from "express"; 
import { requireFirebase } from "../../middleware/requireFirebase";
import { validate } from "../../middleware/validate";
import  { KycSchema } from "../../schemas/kyc";
import { createAlpacaAccountFor, getTradingAccountSnapshot } from '../../services/accountService';

export const accountsRouter = Router(); 

accountsRouter.post("/", requireFirebase, validate(KycSchema), async (req, res) => {
    try {
        const emailClaim = (req as any). claims?.email;
        const result = await createAlpacaAccountFor(req.uid!, emailClaim, req.body, req.ip);
        res.status(201).json({ ok: true, ...result});

    }catch (e: any) {
        res.status(400).json({ ok: false, error: e?.response?.data ?? e.message})
    } 
}); 

accountsRouter.get ("/me", requireFirebase, async (req, res) => {
    try {
        const snap = await getTradingAccountSnapshot(req.uid!);
        res.json({ ok: true, account: snap})
    } catch (e: any) {
        const code = e.message === "not connected" ? 404: 400;
        res.status(code).json({ ok: false, error: e?.response?.data ?? e.message})
    }
}); 