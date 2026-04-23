import mongoose from "mongoose";
import Product from "../models/Product.js";
import StockLedger from "../models/StockLedger.js";
import { StockRepository } from "../repositories/stockRepository.js";
import { BadRequestError } from "./AppError.js";

/**
 * Stock Operations Utility
 * Handles atomic stock operations and transactions
 * Ensures data consistency and prevents race conditions
 */

/**
 * Atomic increment operation for stock
 * Uses MongoDB $inc operator for safe concurrent updates
 * 
 * Usage: Increase stock when items are purchased
 */
export const atomicIncreaseStock = async (
  productId: string,
  userId: string,
  quantity: number,
  transactionType: "purchase" | "return" | "adjustment",
  reference?: string
): Promise<{ previousStock: number; newStock: number }> => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    // Get current stock before update
    const productBefore = await Product.findOne({ _id: productId, userId }).session(session);
    if (!productBefore) {
      throw new Error("Product not found");
    }

    const previousStock = productBefore.currentStock;

    // Atomic increment
    const updated = await Product.findOneAndUpdate(
      { _id: productId, userId },
      { $inc: { currentStock: quantity } },
      { new: true, session }
    );

    const newStock = updated?.currentStock ?? previousStock + quantity;

    // Create ledger entry
    await StockLedger.create(
      [
        {
          companyId: productBefore.companyId,
          userId: new mongoose.Types.ObjectId(userId),
          productId: new mongoose.Types.ObjectId(productId),
          transactionType,
          quantity,
          previousStock,
          newStock,
          reference,
        },
      ],
      { session }
    );

    await session.commitTransaction();
    session.endSession();

    return { previousStock, newStock };
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    throw error;
  }
};

/**
 * Atomic decrement operation for stock
 * Uses MongoDB $inc operator with negative value
 * 
 * Usage: Decrease stock when items are sold
 */
export const atomicDecreaseStock = async (
  productId: string,
  userId: string,
  quantity: number,
  allowNegative: boolean = false,
  transactionType: "sales" | "adjustment" = "sales",
  reference?: string
): Promise<{ previousStock: number; newStock: number }> => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    // Get current stock
    const productBefore = await Product.findOne({ _id: productId, userId }).session(session);
    if (!productBefore) {
      throw new Error("Product not found");
    }

    const previousStock = productBefore.currentStock;
    const newStock = previousStock - quantity;

    // Check if negative stock is allowed
    if (!allowNegative && newStock < 0) {
      await session.abortTransaction();
      session.endSession();
      throw new BadRequestError(
        `Insufficient stock. Available: ${previousStock}, Required: ${quantity}`
      );
    }

    // Atomic decrement
    const updated = await Product.findOneAndUpdate(
      { _id: productId, userId },
      { $inc: { currentStock: -quantity } },
      { new: true, session }
    );

    // Create ledger entry
    await StockLedger.create(
      [
        {
          companyId: productBefore.companyId,
          userId: new mongoose.Types.ObjectId(userId),
          productId: new mongoose.Types.ObjectId(productId),
          transactionType,
          quantity: -quantity, // Negative for deductions
          previousStock,
          newStock: updated?.currentStock ?? newStock,
          reference,
        },
      ],
      { session }
    );

    await session.commitTransaction();
    session.endSession();

    return { previousStock, newStock };
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    throw error;
  }
};

/**
 * Batch stock update with transaction
 * Updates multiple products atomically
 * Either all succeed or all fail
 */
export const batchUpdateStock = async (
  userId: string,
  updates: Array<{
    productId: string;
    quantity: number;
    type: "increase" | "decrease";
    transactionType: "purchase" | "sales" | "return" | "adjustment";
    reference?: string;
  }>,
  allowNegative: boolean = false
): Promise<void> => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    for (const update of updates) {
      const product = await Product.findOne({ _id: update.productId, userId }).session(session);
      if (!product) {
        throw new Error(`Product ${update.productId} not found`);
      }

      const previousStock = product.currentStock;
      const quantityChange = update.type === "increase" ? update.quantity : -update.quantity;
      const newStock = previousStock + quantityChange;

      // Validate stock constraints
      if (!allowNegative && newStock < 0) {
        throw new BadRequestError(
          `Insufficient stock for product ${product.productName}. Available: ${previousStock}, Required: ${update.quantity}`
        );
      }

      // Update product
      await Product.findOneAndUpdate(
        { _id: update.productId, userId },
        { $inc: { currentStock: quantityChange } },
        { session }
      );

      // Create ledger entry
      await StockLedger.create(
        [
          {
            companyId: product.companyId,
            userId: new mongoose.Types.ObjectId(userId),
            productId: new mongoose.Types.ObjectId(update.productId),
            transactionType: update.transactionType,
            quantity: quantityChange,
            previousStock,
            newStock,
            reference: update.reference,
          },
        ],
        { session }
      );
    }

    await session.commitTransaction();
    session.endSession();
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    throw error;
  }
};

/**
 * Verify stock availability for a transaction
 * Checks multiple products without modifying them
 */
export const verifyStockAvailability = async (
  userId: string,
  items: Array<{ productId: string; quantity: number }>
): Promise<{
  available: boolean;
  insufficient: Array<{ productId: string; required: number; available: number }>;
}> => {
  const insufficient: Array<{ productId: string; required: number; available: number }> = [];

  for (const item of items) {
    const product = await Product.findOne({ _id: item.productId, userId });
    if (!product) {
      insufficient.push({
        productId: item.productId,
        required: item.quantity,
        available: 0,
      });
    } else if (product.currentStock < item.quantity) {
      insufficient.push({
        productId: item.productId,
        required: item.quantity,
        available: product.currentStock,
      });
    }
  }

  return {
    available: insufficient.length === 0,
    insufficient,
  };
};

/**
 * Reverse a transaction (e.g., when an invoice is deleted)
 * Restores stock from ledger entry
 */
export const reverseTransaction = async (
  userId: string,
  ledgerId: string
): Promise<void> => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    // Get ledger entry
    const ledgerEntry = await StockLedger.findOne({ _id: ledgerId, userId }).session(session);
    if (!ledgerEntry) {
      throw new Error("Ledger entry not found");
    }

    // Reverse the transaction by inverting the quantity
    const reverseQuantity = -ledgerEntry.quantity;

    // Update product stock
    await Product.findOneAndUpdate(
      { _id: ledgerEntry.productId, userId },
      { $inc: { currentStock: reverseQuantity } },
      { session }
    );

    // Create reversal ledger entry
    await StockLedger.create(
      [
        {
          companyId: ledgerEntry.companyId,
          userId: new mongoose.Types.ObjectId(userId),
          productId: new mongoose.Types.ObjectId(ledgerEntry.productId.toString()),
          transactionType: "adjustment",
          quantity: reverseQuantity,
          previousStock: ledgerEntry.newStock,
          newStock: ledgerEntry.previousStock,
          reference: `REVERSAL: ${ledgerEntry._id}`,
          reason: `Reversal of ${ledgerEntry.transactionType} transaction`,
        },
      ],
      { session }
    );

    await session.commitTransaction();
    session.endSession();
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    throw error;
  }
};
