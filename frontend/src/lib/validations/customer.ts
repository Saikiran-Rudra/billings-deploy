import { z } from "zod";

const phoneRegex = /^[+]?[\d\s()-]{7,15}$/;
const panRegex = /^[A-Z]{5}[0-9]{4}[A-Z]$/;
const gstinRegex = /^\d{2}[A-Z]{5}\d{4}[A-Z]\d[Z][A-Z0-9]$/;

const addressSchema = z.object({
  street: z.string().trim().optional().default(""),
  city: z.string().trim().optional().default(""),
  state: z.string().trim().optional().default(""),
  pinCode: z.string().trim().optional().default(""),
  country: z.string().trim().optional().default(""),
});

export const customerSchema = z
  .object({
    customerType: z.enum(["Business", "Individual"], {
      message: "Customer type is required",
    }),
    salutation: z.string().optional().default(""),
    firstName: z.string().trim().min(1, "First name is required"),
    lastName: z.string().trim().min(1, "Last name is required"),
    companyName: z.string().trim().optional().default(""),
    displayName: z.string().trim().min(1, "Display name is required"),
    email: z.string().trim().toLowerCase().email("Please enter a valid email"),
    companyNumber: z.string().trim().optional().default(""),
    primaryPhone: z
      .string()
      .trim()
      .min(1, "Primary phone is required")
      .regex(phoneRegex, "Please enter a valid phone number"),
    alternatePhone: z
      .string()
      .trim()
      .optional()
      .default("")
      .refine((val) => val === "" || phoneRegex.test(val), {
        message: "Please enter a valid phone number",
      }),

    // GST
    gstTreatment: z
      .string()
      .optional()
      .transform((val) => (val === "" || !val ? undefined : val))
      .pipe(
        z
          .enum(["Unregistered", "Registered", "composition scheme", "SEZ"])
          .optional(),
      ),
    gstNumber: z.string().trim().optional().default(""),
    gstName: z.string().trim().optional().default(""),
    tradeName: z.string().trim().optional().default(""),
    reverseCharge: z.string().optional().default(""),
    reverseChargeReason: z.string().optional().default(""),
    countryOfResidence: z.string().optional().default(""),

    // Addresses
    billing: addressSchema.optional().default({ street: "", city: "", state: "", pinCode: "", country: "" }),
    sameAsBilling: z.boolean().optional().default(false),
    shipping: addressSchema.optional().default({ street: "", city: "", state: "", pinCode: "", country: "" }),

    // Tax
    placeOfSupply: z.string().optional().default(""),
    panNumber: z
      .string()
      .trim()
      .optional()
      .default("")
      .refine((val) => val === "" || panRegex.test(val), {
        message: "Invalid PAN format (e.g., ABCDE1234F)",
      }),
    taxPreference: z.enum(["tax", "exempted", ""]).optional().default(""),
    taxExemptionReason: z.string().trim().optional().default(""),
    defaultTaxRate: z.string().optional().default(""),

    // Payment
    openingBalance: z.union([z.string(), z.number()]).refine((val) => !val || (typeof val === "string" ? !isNaN(Number(val)) : true), "Invalid amount").optional().default(""),
    creditLimit: z.union([z.string(), z.number()]).refine((val) => !val || (typeof val === "string" ? !isNaN(Number(val)) : true), "Invalid amount").optional().default(""),
    paymentTerms: z.string().optional().default(""),
    preferredPaymentMethod: z.string().optional().default(""),

    // Additional
    notes: z.string().trim().optional().default(""),
    tags: z.string().trim().optional().default(""),
    customerStatus: z.enum(["active", "inactive", "blocked"]).optional().default("active"),
  })
  .superRefine((data, ctx) => {
    // GSTIN required for Registered / Composition / SEZ
    if (
      data.gstTreatment &&
      ["Registered", "composition scheme", "SEZ"].includes(data.gstTreatment) &&
      !data.gstNumber
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "GST number is required for this GST treatment",
        path: ["gstNumber"],
      });
    }

    // Validate GSTIN format when provided
    if (data.gstNumber && !gstinRegex.test(data.gstNumber)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Invalid GSTIN format (e.g., 22ABCDE1234F1Z5)",
        path: ["gstNumber"],
      });
    }

    // Tax exemption reason required when exempted
    if (data.taxPreference === "exempted" && !data.taxExemptionReason) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Reason for tax exemption is required",
        path: ["taxExemptionReason"],
      });
    }

    // Default tax rate required when tax preference is tax
    if (data.taxPreference === "tax" && !data.defaultTaxRate) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Default tax rate is required",
        path: ["defaultTaxRate"],
      });
    }
  });

export type CustomerFormData = z.infer<typeof customerSchema>;
