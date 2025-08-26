import { z } from "zod";

export const KycSchema = z.object({
  contact: z.object({
    phone_number: z.string(),
    street_address: z.array(z.string()).min(1),
    city: z.string(),
    state: z.string().length(2),
    postal_code: z.string(),
    country: z.string().default("USA"),
  }),
  identity: z.object({
    given_name: z.string(),
    family_name: z.string(),
    date_of_birth: z.string(), 
    tax_id_type: z.string(),  
    tax_id: z.string(),
    country_of_citizenship: z.string(),
    country_of_birth: z.string(),
    country_of_tax_residence: z.string(),
    funding_source: z.array(z.string()).min(1),
  }),
  disclosures: z.object({
    is_control_person: z.boolean(),
    is_affiliated_exchange_or_finra: z.boolean(),
    is_politically_exposed: z.boolean(),
    immediate_family_exposed: z.boolean(),
  }),
  agreements: z.array(z.object({
    agreement: z.string().default("customer_agreement"),
  })).min(1),
});
