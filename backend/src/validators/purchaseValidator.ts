import { z } from "zod";

// Helper to prevent scientific notation in price fields
const preventScientificNotation = (value: string | number): boolean => {
  const str = String(value).toLowerCase();
  return !str.includes("e");
};

export const purchaseItemSchema = z.object({
  productId: z.string().min(1, "Product ID is required"),
  quantity: z
    .number()
    .positive("Quantity must be greater than 0")
    .refine((val) => Number.isInteger(val) || val % 1 === 0, "Quantity must be a valid number"),
  purchasePrice: z
    .number()
    .positive("Purchase price must be greater than 0")
    .refine(preventScientificNotation, "Price cannot use scientific notation"),
});

export const createPurchaseSchema = z.object({
  companyId: z.string().min(1, "Company ID is required"),
  supplierId: z.string().min(1, "Supplier ID is required"),
  purchaseNumber: z.string().min(1, "Purchase number is required"),
  purchaseDate: z.string().datetime().optional(),
  items: z
    .array(purchaseItemSchema)
    .min(1, "At least one item is required"),
  paidAmount: z
    .number()
    .min(0, "Paid amount cannot be negative")
    .optional()
    .default(0),
  notes: z.string().optional().default(""),
});

export const updatePurchaseSchema = z.object({
  paidAmount: z
    .number()
    .min(0, "Paid amount cannot be negative")
    .optional(),
  notes: z.string().optional(),
  status: z.enum(["Paid", "Partial", "Unpaid"]).optional(),
});

export const purchaseIdSchema = z.object({
  id: z.string().min(1, "Purchase ID is required"),
});

export type CreatePurchaseInput = z.infer<typeof createPurchaseSchema>;
export type UpdatePurchaseInput = z.infer<typeof updatePurchaseSchema>;
export type PurchaseItem = z.infer<typeof purchaseItemSchema>;
