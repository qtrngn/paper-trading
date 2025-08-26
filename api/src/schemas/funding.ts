import { z } from "zod";
export const FundingSchema = z.object({
  amount: z.string().optional(), 
});
