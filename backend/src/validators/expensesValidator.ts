import { z } from "zod";
import mongoose from "mongoose";
import { CATEGORY, PAYMENT_METHOD, STATUS } from "../enum/expense.js";

export const createExpenseSchema = z.object({
    // CompanyId is REQUIRED but ONLY set by backend middleware
    companyId: z
      .string()
      .min(1, "Company ID is required")
      .refine(
        id => mongoose.Types.ObjectId.isValid(id),
        "Company ID must be a valid MongoDB ObjectId"
      )
      .describe("Company context - set by middleware, not from user input"),
    expenseDate:z.string(),
    amount:z.number(),
    category:z.enum(CATEGORY),
    paymentMode:z.enum(PAYMENT_METHOD),
    vendor:z.string().optional(),
    referenceNumber:z.string().optional(),
    description:z.string().optional(),
    status:z.enum(STATUS).optional(),
});