import { z } from "zod";

export const businessTypeOptions = [
  "proprietorship",
  "partnership",
  "llp",
  "private_limited",
  "public_limited",
  "trust",
  "ngo",
  "other",
] as const;

export const industryOptions = [
  "retail",
  "manufacturing",
  "services",
  "technology",
  "healthcare",
  "education",
  "construction",
  "food_beverage",
  "logistics",
  "other",
] as const;

const gstRegex =
  /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z][1-9A-Z]Z[0-9A-Z]$/;
const panRegex = /^[A-Z]{5}[0-9]{4}[A-Z]$/;
const mobileRegex = /^[6-9][0-9]{9}$/;
export const gstStatusOptions = ["YES", "NO"] as const;
export type GstStatus = (typeof gstStatusOptions)[number];

const companyBaseSchema = z.object({
  name: z.string().min(2, "Company name must be at least 2 characters").max(100),
  businessType: z.enum(businessTypeOptions),
  industry: z.enum(industryOptions),
  address: z.string().min(5, "Business address is required"),
  financialYearStart: z.string().min(1, "Financial year start is required"),
  gstStatus: z.enum(gstStatusOptions),
  gstNumber: z.string().optional(),
  gstDocumentUrl: z.string().optional(),
  panNumber: z
    .string()
    .transform((value) => value.toUpperCase())
    .refine((value) => panRegex.test(value), "Invalid PAN number"),
  panDocumentUrl: z.string().min(1, "PAN document is required"),
  admin: z.object({
    firstName: z.string().min(1, "First name is required"),
    lastName: z.string().min(1, "Last name is required"),
    email: z.string().email("Invalid email address"),
    mobile: z.string().regex(mobileRegex, "Invalid mobile number"),
  }),
});

const validateGst = (
  value: {
    gstStatus?: GstStatus;
    gstNumber?: string;
    gstDocumentUrl?: string;
    panDocumentUrl?: string;
  },
  ctx: z.RefinementCtx
) => {
  if (!value.panDocumentUrl) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ["panDocumentUrl"],
      message: "PAN document is required",
    });
  }

  if (value.gstStatus === "YES" && !value.gstNumber) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ["gstNumber"],
      message: "GST number is required",
    });
  }

  if (value.gstStatus === "YES" && !value.gstDocumentUrl) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ["gstDocumentUrl"],
      message: "GST document is required when GST is enabled",
    });
  }

  if (
    value.gstStatus === "YES" &&
    value.gstNumber &&
    !gstRegex.test(value.gstNumber)
  ) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ["gstNumber"],
      message: "Invalid GST number",
    });
  }
};

export const companySchema = companyBaseSchema.superRefine(validateGst);
export const companyUpdateSchema = companyBaseSchema.omit({ admin: true }).superRefine(validateGst);

export interface Company {
  _id?: string;
  id?: string;
  name: string;
  businessType?: string;
  industry?: string;
  address?: string;
  financialYearStart?: string;
  gstStatus?: GstStatus | boolean;
  gstNumber?: string;
  gstDocumentUrl?: string;
  panNumber?: string;
  panDocumentUrl?: string;
  ownerEmail?: string;
  phone?: string;
  status: "active" | "inactive" | "archived";
  businessInfo?: {
    businessName?: string;
    businessType?: string;
    industry?: string;
    businessAddress?: string;
  };
  taxInfo?: {
    gstRegistration?: GstStatus | string;
    gstStatus?: GstStatus | string;
    gstNumber?: string;
    gstin?: string;
    gstDocumentUrl?: string;
    panNumber?: string;
    panDocumentUrl?: string;
    financialYearStart?: string;
  };
  createdAt?: string;
  updatedAt?: string;
}

export type CompanyFormData = z.infer<typeof companySchema>;
export type CompanyUpdateFormData = z.infer<typeof companyUpdateSchema>;
