import { z } from "zod";
import mongoose from "mongoose";
import AppError from "../utils/AppError.js";

/**
 * Create Sales Return Schema
 */
export const createSalesReturnSchema = z.object({
  // CompanyId is REQUIRED but ONLY set by backend middleware
  companyId: z
    .string()
    .min(1, "Company ID is required")
    .refine(
      id => mongoose.Types.ObjectId.isValid(id),
      "Company ID must be a valid MongoDB ObjectId"
    )
    .describe("Company context - set by middleware, not from user input"),
  returnId: z
    .string()
    .min(1, "Return ID is required"),
  date: z
    .string()
    .min(1, "Date is required"),
  originalInvoice: z
    .string()
    .min(1, "Original invoice reference is required"),
  customer: z
    .string()
    .min(1, "Customer is required"),
  items: z
    .string()
    .min(1, "Items description is required"),
  amount: z
    .number()
    .nonnegative("Amount must be a valid non-negative number"),
  status: z
    .enum(["pending", "approved", "rejected", "completed"])
    .optional(),
  notes: z
    .string()
    .optional(),
});

export interface SalesReturnInput extends z.infer<typeof createSalesReturnSchema> {}

const VALID_STATUSES = ["pending", "approved", "rejected", "completed"];

/**
 * Validates sales return input payload.
 * Throws an AppError (400) if validation fails.
 */
export const validateSalesReturnInput = (data: SalesReturnInput): void => {
  try {
    createSalesReturnSchema.parse(data);
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errorMessage = error.issues[0]?.message || "Validation failed";
      throw new AppError(errorMessage, 400);
    }
    throw error;
  }
};
