import { z } from "zod";
import {
  BUSINESS_TYPES,
  COMPANY_STATUS_VALUES,
  GST_STATUS,
  GST_STATUS_VALUES,
  INDUSTRIES,
} from "../constants/company.constants.js";

const gstRegex =
  /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z][1-9A-Z]Z[0-9A-Z]$/;
const panRegex = /^[A-Z]{5}[0-9]{4}[A-Z]$/;
const mobileRegex = /^[6-9][0-9]{9}$/;
const documentSchema = z
  .string()
  .trim()
  .url("Document URL must be a valid URL")
  .optional()
  .or(z.literal(""));

const gstStatusSchema = z.preprocess((value) => {
  if (typeof value === "boolean") {
    return value ? GST_STATUS.YES : GST_STATUS.NO;
  }

  if (typeof value === "string") {
    const normalized = value.trim().toUpperCase();
    if (normalized === "TRUE" || normalized === GST_STATUS.YES) {
      return GST_STATUS.YES;
    }

    if (normalized === "FALSE" || normalized === GST_STATUS.NO) {
      return GST_STATUS.NO;
    }
  }

  return value;
}, z.enum(GST_STATUS_VALUES));

const companyBaseSchema = z
  .object({
    name: z.string().trim().min(2, "Company name is required").max(120),
    businessType: z.enum(BUSINESS_TYPES),
    industry: z.enum(INDUSTRIES),
    address: z.string().trim().min(5, "Business address is required").max(500),
    financialYearStart: z.string().min(1, "Financial year start is required"),
    gstStatus: gstStatusSchema,
    gstNumber: z.string().trim().toUpperCase().optional().or(z.literal("")),
    gstDocumentUrl: documentSchema,
    panNumber: z.string().trim().toUpperCase().regex(panRegex, "Invalid PAN number"),
    panDocumentUrl: documentSchema,
    admin: z.object({
      firstName: z.string().trim().min(1, "Admin first name is required"),
      lastName: z.string().trim().min(1, "Admin last name is required"),
      email: z.string().trim().email("Invalid admin email").toLowerCase(),
      mobile: z.string().trim().regex(mobileRegex, "Invalid mobile number"),
    }),
  });

export const companyCreateSchema = companyBaseSchema
  .superRefine((value, ctx) => {
    if (value.gstStatus === GST_STATUS.YES && !value.gstNumber) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["gstNumber"],
        message: "GST number is required",
      });
    }

    if (value.gstStatus === GST_STATUS.YES && value.gstNumber && !gstRegex.test(value.gstNumber)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["gstNumber"],
        message: "Invalid GST number",
      });
    }

    if (value.gstStatus === GST_STATUS.YES && !value.gstDocumentUrl) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["gstDocumentUrl"],
        message: "GST document is required when GST registration is YES",
      });
    }

    if (!value.panDocumentUrl) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["panDocumentUrl"],
        message: "PAN document is required",
      });
    }
  });

export const companyUpdateSchema = companyBaseSchema
  .omit({ admin: true })
  .partial()
  .superRefine((value, ctx) => {
    if (value.gstStatus === GST_STATUS.YES && !value.gstNumber) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["gstNumber"],
        message: "GST number is required",
      });
    }

    if (value.gstNumber && !gstRegex.test(value.gstNumber)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["gstNumber"],
        message: "Invalid GST number",
      });
    }
  });

export const companyStatusSchema = z.object({
  status: z.enum(COMPANY_STATUS_VALUES),
});

export const companyListQuerySchema = z.object({
  page: z.coerce.number().int().positive().optional(),
  limit: z.coerce.number().int().positive().max(100).optional(),
  search: z.string().trim().optional(),
});
