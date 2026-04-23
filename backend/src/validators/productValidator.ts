import { z } from "zod";
import mongoose from "mongoose";

/**
 * Product Validation Schemas
 * Follows existing validation patterns with Zod
 */

const SKU_REGEX = /^[A-Z0-9\-]+$/;

/**
 * Create Product Schema
 */
export const createProductSchema = z.object({
  // CompanyId is REQUIRED but ONLY set by backend middleware
  companyId: z
    .string()
    .min(1, "Company ID is required")
    .refine(
      id => mongoose.Types.ObjectId.isValid(id),
      "Company ID must be a valid MongoDB ObjectId"
    )
    .describe("Company context - set by middleware, not from user input"),
  productName: z
    .string()
    .min(1, "Product name is required")
    .max(100, "Product name must be less than 100 characters"),
  sku: z
    .string()
    .min(1, "SKU is required")
    .regex(SKU_REGEX, "SKU must contain only uppercase letters, numbers, and hyphens"),
  category: z
    .string()
    .min(1, "Category is required"),
  unit: z
    .string()
    .min(1, "Unit is required"),
  salePrice: z
    .number()
    .min(0, "Sale price must be greater than or equal to 0"),
  purchasePrice: z
    .number()
    .min(0, "Purchase price must be greater than or equal to 0"),
  gst: z
    .number()
    .min(0, "GST must be between 0 and 100")
    .max(100, "GST must be between 0 and 100")
    .optional(),
  description: z
    .string()
    .optional()
    .default(""),
  hsn: z
    .string()
    .optional()
    .default(""),
  status: z
    .enum(["active", "inactive"])
    .default("active"),
});

/**
 * Update Product Schema
 * Makes all fields optional except product ID
 */
export const updateProductSchema = createProductSchema.partial();

// Export types
export type CreateProductInput = z.infer<typeof createProductSchema>;
export type UpdateProductInput = z.infer<typeof updateProductSchema>;
