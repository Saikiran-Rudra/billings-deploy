import { z } from "zod";

const featureSchema = z.object({
  companies: z.boolean(),
  supplier: z.boolean(),
  purchase: z.boolean(),
  reports: z.boolean(),
  apiAccess: z.boolean()
});

export const createLicenseSchema = z.object({
  name: z.string().min(2),
  price: z.number().min(0),
  durationInDays: z.number().min(1),
  userLimit: z.number().min(1),
  features: featureSchema
});

export const assignLicenseSchema = z.object({
  companyId: z.string().min(1),
  licenseId: z.string().min(1)
});