// validators/license.validator.ts

import { z } from "zod";

export const licenseSchema = z.object({
  name: z.string().min(2),
  price: z.number().min(0),
  durationInDays: z.number().min(1),
  userLimit: z.number().min(1),
  features: z.object({
    companies: z.boolean(),
    supplier: z.boolean(),
    purchase: z.boolean(),
    reports: z.boolean(),
    apiAccess: z.boolean()
  })
});