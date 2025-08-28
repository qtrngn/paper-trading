import { Router } from "express"; 
import { requireFirebase } from "../../middleware/requireFirebase";
import { validate } from "../../middleware/validate";
import { FundingSchema } from "../../schemas/funding";
import { fundAccount } from "../../services/fundingService";

export const fundingRouter = Router(); 

fundingRouter.post("/", requireFirebase, validate(FundingSchema), async(req,res) => {
    try {
        const r = await fundAccount(req.uid!, req.body.amount);
        res.status(201).json ({ ok: true, ...r});

    } catch (e:any) {
        const code = e.message === "account not found" ? 404 : 400;
        res.status(code).json({ ok: false, error: e?.response?.data ?? e.message})
    }

});