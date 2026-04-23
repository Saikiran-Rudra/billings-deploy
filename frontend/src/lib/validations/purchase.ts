import { z } from "zod";

const phoneRegex = /^[+]?[\d\s()-]{7,15}$/;
const gstinRegex = /^[0-9A-Z]{15}$/;
const pincodeRegex = /^\d{6}$/;
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const addressSchema = z.object({
  street: z.string().trim().min(1, "Street address is required"),
  city: z.string().trim().min(1, "City is required"),
  state: z.string().trim().min(1, "State is required"),
  country: z.string().trim().default("India"),
  pincode: z
    .string()
    .trim()
    .regex(pincodeRegex, "Pincode must be exactly 6 digits"),
});

export const purchaseItemSchema = z.object({
  productId: z.string().min(1, "Product is required"),
  productName: z.string().optional(),
  quantity: z
    .union([z.string(), z.number()])
    .refine((val) => {
      const num = typeof val === "string" ? parseFloat(val) : val;
      return !isNaN(num) && num > 0;
    }, "Quantity must be a valid positive number")
    .transform((val) => {
      const num = typeof val === "string" ? parseFloat(val) : val;
      return num;
    }),
  purchasePrice: z
    .union([z.string(), z.number()])
    .refine((val) => {
      const num = typeof val === "string" ? parseFloat(val) : val;
      return !isNaN(num) && num >= 0;
    }, "Purchase price must be a valid non-negative number")
    .transform((val) => {
      const num = typeof val === "string" ? parseFloat(val) : val;
      return num;
    }),
  taxRate: z
    .union([z.string(), z.number()])
    .optional()
    .default(0)
    .transform((val) => {
      if (!val || val === "") return 0;
      const num = typeof val === "string" ? parseFloat(val) : val;
      return isNaN(num) ? 0 : num;
    })
    .refine((val) => val >= 0 && val <= 100, "Tax rate must be between 0 and 100"),
  unit: z.string().optional().default(""),
  taxableAmount: z.number().optional().default(0),
  cgst: z.number().optional().default(0),
  sgst: z.number().optional().default(0),
  igst: z.number().optional().default(0),
  totalAmount: z.number().optional().default(0),
});

export const purchaseSchema = z
  .object({
    supplierId: z.string().min(1, "Vendor is required"),
    supplierSnapshot: z
      .object({
        supplierId: z.string().optional(),
        supplierName: z.string().optional(),
        companyName: z.string().optional(),
        phone: z.string().optional(),
        email: z.string().optional(),
        address: addressSchema.optional(),
        gstNumber: z.string().optional(),
        state: z.string().optional(),
        isGSTRegistered: z.boolean().optional(),
      })
      .optional(),
    items: z
      .array(purchaseItemSchema)
      .min(1, "At least one item is required"),
    notes: z.string().trim().optional().default(""),
    status: z
      .enum(["draft", "confirmed", "cancelled"])
      .optional()
      .default("draft"),
  })
  .strict();

export type PurchaseItemFormData = z.infer<typeof purchaseItemSchema>;
export type PurchaseFormData = z.infer<typeof purchaseSchema>;

// SupplierSnapshot type for preview
export interface SupplierSnapshot {
  supplierId: string;
  supplierName: string;
  companyName: string;
  phone: string;
  email: string;
  address: {
    street: string;
    city: string;
    state: string;
    country: string;
    pincode: string;
  };
  gstNumber?: string;
  state: string;
  isGSTRegistered: boolean;
}

// Purchase type for API responses
export interface Purchase {
  _id: string;
  id: string;
  companyId: string;
  supplierId: string;
  purchaseNumber: string;
  supplierSnapshot: SupplierSnapshot;
  taxType: "intra" | "inter" | "zero" | "none";
  items: PurchaseItemFormData[];
  subtotal: number;
  totalCGST: number;
  totalSGST: number;
  totalIGST: number;
  totalGST: number;
  grandTotal: number;
  notes?: string;
  status: "draft" | "confirmed" | "cancelled";
  isDeleted: boolean;
  createdAt: string;
  updatedAt: string;
}
