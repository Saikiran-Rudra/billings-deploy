import { z } from "zod";

const phoneRegex = /^[+]?[\d\s()-]{7,15}$/;
const gstinRegex = /^[0-9A-Z]{15}$/;
const pincodeRegex = /^\d{6}$/;
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const addressSchema = z.object({
  street: z
    .string()
    .trim()
    .min(1, "Street address is required"),
  city: z
    .string()
    .trim()
    .min(1, "City is required"),
  state: z
    .string()
    .trim()
    .min(1, "State is required"),
  country: z
    .string()
    .trim()
    .default("India"),
  pincode: z
    .string()
    .trim()
    .regex(pincodeRegex, "Pincode must be exactly 6 digits"),
});

export const supplierSchema = z
  .object({
    supplierName: z
      .string()
      .trim()
      .min(1, "Supplier name is required")
      .min(3, "Supplier name must be at least 3 characters"),

    companyName: z
      .string()
      .trim()
      .min(1, "Company name is required")
      .min(3, "Company name must be at least 3 characters"),

    email: z
      .string()
      .trim()
      .toLowerCase()
      .email("Please enter a valid email address"),

    phone: z
      .string()
      .trim()
      .regex(phoneRegex, "Please enter a valid phone number"),

    isGSTRegistered: z.boolean().default(false),

    gstNumber: z
      .string()
      .trim()
      .optional()
      .refine((val) => val === "" || val === undefined || gstinRegex.test(val), {
        message: "GST number must be 15 alphanumeric characters",
      }),

    billingAddress: addressSchema,

    shippingAddress: addressSchema,

    paymentTerms: z
      .string()
      .trim()
      .min(1, "Payment terms are required"),

    openingBalance: z
      .union([z.string(), z.number()])
      .optional()
      .refine(
        (val) => !val || (typeof val === "string" ? !isNaN(Number(val)) : true),
        "Opening balance must be a valid number"
      )
      .transform((val) => {
        if (!val || val === "") return undefined;
        const num = typeof val === "string" ? parseFloat(val) : val;
        return isNaN(num) ? undefined : num;
      }),

    notes: z
      .string()
      .trim()
      .optional()
      .default(""),

    status: z
      .enum(["active", "inactive"])
      .default("active"),
  })
  .superRefine((data, ctx) => {
    // GST number required when registered
    if (data.isGSTRegistered && (!data.gstNumber || data.gstNumber.trim() === "")) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "GST number is required when GST is registered",
        path: ["gstNumber"],
      });
    }

    // Validate GST number format when provided and registered
    if (data.isGSTRegistered && data.gstNumber && !gstinRegex.test(data.gstNumber)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Invalid GST number format",
        path: ["gstNumber"],
      });
    }
  });

export type SupplierFormData = z.infer<typeof supplierSchema>;

export type Supplier = SupplierFormData & {
  _id?: string;
  id?: string;
  companyId: string;
  createdAt?: string;
  updatedAt?: string;
};
