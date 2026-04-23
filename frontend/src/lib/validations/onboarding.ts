import { z } from "zod";

// ── Business Info (Step 1) - ALL MANDATORY ──
export const businessSchema = z.object({
  businessName: z
    .string()
    .trim()
    .min(1, "Business name is required")
    .min(2, "Business name must be at least 2 characters")
    .max(100, "Business name must not exceed 100 characters"),
  businessType: z
    .string()
    .min(1, "Business type is mandatory"),
  industry: z
    .string()
    .min(1, "Industry is mandatory"),
  businessAddress: z
    .string()
    .trim()
    .min(1, "Business address is mandatory")
    .min(10, "Address must be at least 10 characters")
    .max(500, "Address must not exceed 500 characters"),
});

export type BusinessFormData = z.infer<typeof businessSchema>;

// ── Bank Account (Step 2) - OPTIONAL ──
export const bankSchema = z.object({
  bankName: z
    .string()
    .optional(),
  accountNumber: z
    .string()
    .optional()
    .refine(
      (val) => !val || /^\d{9,18}$/.test(val),
      "Account number must be 9-18 digits if provided"
    ),
  ifscCode: z
    .string()
    .optional()
    .refine(
      (val) => !val || /^[A-Z]{4}0[A-Z0-9]{6}$/.test(val),
      "Invalid IFSC code format (e.g., SBIN0001234) if provided"
    ),
  branchName: z
    .string()
    .optional()
    .refine((val) => !val || val.trim().length >= 2, "Branch name must be at least 2 characters if provided"),
});

export type BankFormData = z.infer<typeof bankSchema>;

// ── Tax Information (Step 3) - ALL MANDATORY ──
export const taxSchema = z
  .object({
    gstRegistration: z
      .string()
      .min(1, "GST registration status is mandatory"),
    gstin: z.string().trim(),
    panNumber: z
      .string()
      .trim()
      .min(1, "PAN number is mandatory")
      .regex(/^[A-Z]{5}[0-9]{4}[A-Z]$/, "Invalid PAN format (e.g., ABCDE1234F)"),
    financialYearStart: z
      .string()
      .min(1, "Financial year start is mandatory"),
  })
  .refine(
    (data) => {
      if (data.gstRegistration === "Registered" || data.gstRegistration === "Composition Scheme") {
        return /^\d{2}[A-Z]{5}\d{4}[A-Z]\d[Z][A-Z0-9]$/.test(data.gstin);
      }
      return true;
    },
    {
      message: "Valid GSTIN is required for registered businesses (e.g., 22ABCDE1234F1Z5)",
      path: ["gstin"],
    }
  )
  .refine(
    (data) => {
      if (data.gstRegistration === "Registered" || data.gstRegistration === "Composition Scheme") {
        return data.gstin.trim().length > 0;
      }
      return true;
    },
    {
      message: "GSTIN is mandatory for registered/composition scheme businesses",
      path: ["gstin"],
    }
  );

export type TaxFormData = z.infer<typeof taxSchema>;
