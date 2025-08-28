import type { ZodTypeAny } from "zod";
import type { Request, Response, NextFunction } from "express";

export function validate(schema:  ZodTypeAny ) {
    return (req: Request, res:Response, next: NextFunction) => {
        const parsed = schema.safeParse(req.body);
        if (!parsed.success) {
            return res.status(400).json({
               ok:false, error:"validation_error", issues: parsed.error.issues
            });
        }
      req.body = parsed.data;
      next(); 
    }
}
