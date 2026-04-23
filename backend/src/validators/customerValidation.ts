import { z } from "zod";
import mongoose from "mongoose";

/**
 * Regex patterns for validation
 */
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const GSTIN_REGEX = /^\d{2}[A-Z]{5}\d{4}[A-Z]\d[Z][A-Z0-9]$/;
const PAN_REGEX = /^[A-Z]{5}[0-9]{4}[A-Z]$/;
const PHONE_REGEX = /^[+]?[0-9\s\-()]{10,}$/;

/**
 * Address Schema
 */
const addressSchema = z.object({
  street: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  pinCode: z.string().optional(),
  country: z.string().optional(),
});

/**
 * Create Customer Schema
 * Validates all required and optional fields with proper formats
 */
export const createCustomerSchema = z
  .object({
    // ── Company Context (Required for multi-tenant isolation) ──
    // NEVER trust companyId from user input - always comes from middleware
    companyId: z
      .string()
      .min(1, "Company ID is required")
      .refine(
        id => mongoose.Types.ObjectId.isValid(id),
        "Company ID must be a valid MongoDB ObjectId"
      )
      .describe("Company context - always set by backend middleware"),

    customerType: z
      .enum(["Business", "Individual"])
      .describe("Type of customer"),
    salutation: z.string().optional(),
    firstName: z
      .string()
      .min(1, "First name is required.")
      .describe("Customer first name"),
    lastName: z
      .string()
      .min(1, "Last name is required.")
      .describe("Customer last name"),
    companyName: z.string().optional(),
    displayName: z
      .string()
      .min(1, "Display name is required.")
      .describe("Name to display in documents"),
    email: z
      .string()
      .regex(EMAIL_REGEX, "Please enter a valid email address.")
      .describe("Customer email"),
    companyNumber: z.string().optional(),
    primaryPhone: z
      .string()
      .regex(PHONE_REGEX, "Please enter a valid phone number.")
      .describe("Primary contact number"),
    alternatePhone: z.string().optional(),

    // ── GST Details ──────────────────────────────────────
    gstTreatment: z
      .string()
      .optional()
      .transform((val) => (val?.trim() === "" ? undefined : val?.trim()))
      .pipe(z.enum(["Unregistered", "Registered", "composition scheme", "SEZ"]).optional()),
    gstNumber: z
      .string()
      .refine(
        (val) => !val || val.length === 15,
        "GST number must be exactly 15 characters.",
      )
      .refine(
        (val) => !val || GSTIN_REGEX.test(val),
        "GST number format is invalid.",
      )
      .optional(),
    gstName: z.string().optional(),
    tradeName: z.string().optional(),
    reverseCharge: z
      .union([z.boolean(), z.string()])
      .refine((val) => !val || typeof val === "boolean" || val === "yes" || val === "no", "Invalid reverse charge value.")
      .optional(),
    reverseChargeReason: z.string().optional(),
    countryOfResidence: z.string().optional(),

    // ── Address Details ──────────────────────────────────
    billing: addressSchema.optional(),
    sameAsBilling: z.boolean().optional(),
    shipping: addressSchema.optional(),
    placeOfSupply: z.string().optional(),

    // ── Tax Details ──────────────────────────────────────
    panNumber: z
      .string()
      .refine(
        (val) => !val || PAN_REGEX.test(val),
        "Invalid PAN number format (e.g., ABCDE1234F).",
      )
      .optional(),
    taxPreference: z.enum(["tax", "exempted", ""]).optional(),
    taxExemptionReason: z.string().optional(),
    defaultTaxRate: z
      .union([z.string(), z.number()])
      .refine((val) => !val || (typeof val === "string" ? !isNaN(Number(val)) : true), "Invalid tax rate.")
      .optional(),

    // ── Payment & Credit ─────────────────────────────────
    openingBalance: z
      .union([z.string(), z.number()])
      .refine((val) => !val || (typeof val === "string" ? !isNaN(Number(val)) : true), "Invalid opening balance.")
      .optional(),
    creditLimit: z
      .union([z.string(), z.number()])
      .refine((val) => !val || (typeof val === "string" ? !isNaN(Number(val)) : true), "Invalid credit limit.")
      .optional(),
    paymentTerms: z.string().optional(),
    preferredPaymentMethod: z.string().optional(),

    // ── Metadata ─────────────────────────────────────────
    notes: z.string().optional(),
    tags: z.array(z.string()).optional(),
    customerStatus: z.enum(["active", "inactive", "blocked"]).optional(),
  })
  .superRefine((data, ctx) => {
    // GST rules: if treatment is Registered/Composition Scheme/SEZ, all GST fields are required
    const gstRequiredTreatments = ["Registered", "composition scheme", "SEZ"];
    if (data.gstTreatment && gstRequiredTreatments.includes(data.gstTreatment)) {
      if (!data.gstNumber || data.gstNumber.trim() === "") {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["gstNumber"],
          message: `GST number is required when GST treatment is '${data.gstTreatment}'.`,
        });
      }
      if (!data.gstName || data.gstName.trim() === "") {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["gstName"],
          message: `GST name is required when GST treatment is '${data.gstTreatment}'.`,
        });
      }
      if (!data.tradeName || data.tradeName.trim() === "") {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["tradeName"],
          message: `Trade name is required when GST treatment is '${data.gstTreatment}'.`,
        });
      }
    }

    // Tax rules
    if (data.taxPreference === "exempted" && !data.taxExemptionReason) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["taxExemptionReason"],
        message: "Reason for tax exemption is required when tax preference is exempted.",
      });
    }

    if (data.taxPreference === "tax" && !data.defaultTaxRate) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["defaultTaxRate"],
        message: "Default tax rate is required when tax preference is tax.",
      });
    }
  });

/**
 * Update Customer Schema
 * All fields optional for PATCH/PUT updates
 * Built separately to avoid .partial() limitation with superRefine()
 */
export const updateCustomerSchema = z
  .object({
    // ── Company Context (for security validation) ──
    // Always required to prevent cross-tenant updates
    companyId: z
      .string()
      .min(1, "Company ID is required")
      .refine(
        id => mongoose.Types.ObjectId.isValid(id),
        "Company ID must be a valid MongoDB ObjectId"
      )
      .describe("Company context - for update security"),

    customerType: z
      .enum(["Business", "Individual"])
      .optional(),
    salutation: z.string().optional(),
    firstName: z.string().optional(),
    lastName: z.string().optional(),
    companyName: z.string().optional(),
    displayName: z.string().optional(),
    email: z
      .string()
      .regex(EMAIL_REGEX, "Please enter a valid email address.")
      .optional(),
    companyNumber: z.string().optional(),
    primaryPhone: z
      .string()
      .regex(PHONE_REGEX, "Please enter a valid phone number.")
      .optional(),
    alternatePhone: z.string().optional(),
    gstTreatment: z
      .string()
      .optional()
      .transform((val) => (val?.trim() === "" ? undefined : val?.trim()))
      .pipe(z.enum(["Unregistered", "Registered", "composition scheme", "SEZ"]).optional()),
    gstNumber: z
      .string()
      .refine(
        (val) => !val || val.length === 15,
        "GST number must be exactly 15 characters.",
      )
      .refine(
        (val) => !val || GSTIN_REGEX.test(val),
        "GST number format is invalid.",
      )
      .optional(),
    gstName: z.string().optional(),
    tradeName: z.string().optional(),
    reverseCharge: z
      .any()
      .optional(),
    reverseChargeReason: z.string().optional(),
    countryOfResidence: z.string().optional(),

    // ── Address Details ──────────────────────────────────
    billing: addressSchema.optional(),
    sameAsBilling: z.boolean().optional(),
    shipping: addressSchema.optional(),
    placeOfSupply: z.string().optional(),

    // ── Tax Details ──────────────────────────────────────
    panNumber: z
      .string()
      .refine(
        (val) => !val || PAN_REGEX.test(val),
        "Invalid PAN number format (e.g., ABCDE1234F).",
      )
      .optional(),
    taxPreference: z.enum(["tax", "exempted", ""]).optional(),
    taxExemptionReason: z.string().optional(),
    defaultTaxRate: z
      .union([z.string(), z.number()])
      .refine((val) => !val || (typeof val === "string" ? !isNaN(Number(val)) : true), "Invalid tax rate.")
      .optional(),

    // ── Payment & Credit ─────────────────────────────────
    openingBalance: z
      .union([z.string(), z.number()])
      .refine((val) => !val || (typeof val === "string" ? !isNaN(Number(val)) : true), "Invalid opening balance.")
      .optional(),
    creditLimit: z
      .union([z.string(), z.number()])
      .refine((val) => !val || (typeof val === "string" ? !isNaN(Number(val)) : true), "Invalid credit limit.")
      .optional(),
    paymentTerms: z.string().optional(),
    preferredPaymentMethod: z.string().optional(),

    // ── Metadata ─────────────────────────────────────────
    notes: z.string().optional(),
    tags: z.array(z.string()).optional(),
    customerStatus: z.enum(["active", "inactive", "blocked"]).optional(),
  })
  .superRefine((data, ctx) => {
    // Apply same validation rules as creation for consistency
    // GST rules: if treatment is Registered/Composition Scheme/SEZ, all GST fields are required
    const gstRequiredTreatments = ["Registered", "composition scheme", "SEZ"];
    if (data.gstTreatment && gstRequiredTreatments.includes(data.gstTreatment)) {
      if (!data.gstNumber || data.gstNumber.trim() === "") {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["gstNumber"],
          message: `GST number is required when GST treatment is '${data.gstTreatment}'.`,
        });
      }
      if (!data.gstName || data.gstName.trim() === "") {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["gstName"],
          message: `GST name is required when GST treatment is '${data.gstTreatment}'.`,
        });
      }
      if (!data.tradeName || data.tradeName.trim() === "") {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["tradeName"],
          message: `Trade name is required when GST treatment is '${data.gstTreatment}'.`,
        });
      }
    }

    if (data.taxPreference === "exempted" && !data.taxExemptionReason) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["taxExemptionReason"],
        message: "Reason for tax exemption is required when tax preference is exempted.",
      });
    }

    if (data.taxPreference === "tax" && !data.defaultTaxRate) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["defaultTaxRate"],
        message: "Default tax rate is required when tax preference is tax.",
      });
    }
  });

/**
 * Customer ID Parameter Schema
 */
export const customerIdSchema = z.object({
  id: z.string().min(1, "Customer ID is required."),
});

export type CreateCustomerInput = z.infer<typeof createCustomerSchema>;
export type UpdateCustomerInput = z.infer<typeof updateCustomerSchema>;
