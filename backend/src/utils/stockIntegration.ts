/**
 * Stock Integration Helpers
 * Utility functions for easy stock integration in other modules
 * Use these in Invoice, Purchase, and SalesReturn controllers
 */

import { ProductService } from "../services/productService.js";
import { verifyStockAvailability } from "./stockOperations.js";
import { BadRequestError } from "./AppError.js";

/**
 * Verify and update stock for invoice
 * Call this during invoice creation
 * 
 * @param userId - User ID
 * @param lineItems - Array of {productId, quantity}
 * @param invoiceId - Reference ID
 * @param allowNegative - Allow negative stock (from config)
 * 
 * @throws BadRequestError if stock insufficient
 */
export const verifyAndUpdateInvoiceStock = async (
  userId: string,
  lineItems: Array<{ productId: string; quantity: number }>,
  invoiceId: string,
  allowNegative: boolean = false
): Promise<void> => {
  // Verify stock availability first
  const verification = await verifyStockAvailability(userId, lineItems);
  
  if (!verification.available) {
    const details = verification.insufficient
      .map(i => `${i.productId} (need ${i.required}, have ${i.available})`)
      .join("; ");
    throw new BadRequestError(`Insufficient stock: ${details}`);
  }

  // Update stock
  await ProductService.updateStockFromInvoice(
    userId,
    lineItems,
    invoiceId,
    allowNegative
  );
};

/**
 * Update stock for sales return
 * Call this during sales return creation
 * 
 * @param userId - User ID
 * @param lineItems - Array of {productId, quantity}
 * @param salesReturnId - Reference ID
 */
export const updateSalesReturnStock = async (
  userId: string,
  lineItems: Array<{ productId: string; quantity: number }>,
  salesReturnId: string
): Promise<void> => {
  await ProductService.updateStockFromSalesReturn(userId, lineItems, salesReturnId);
};

/**
 * Reverse stock updates (e.g., when transaction is deleted)
 * 
 * @param userId - User ID
 * @param referenceId - Original transaction ID to reverse
 */
export const reverseStockTransaction = async (
  userId: string,
  referenceId: string
): Promise<void> => {
  const { reverseTransaction } = await import("./stockOperations.js");
  await reverseTransaction(userId, referenceId);
};
