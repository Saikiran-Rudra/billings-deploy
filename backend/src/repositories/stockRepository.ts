import StockLedger, { IStockLedger } from "../models/StockLedger.js";
import mongoose from "mongoose";

/**
 * Stock Repository
 * Handles all stock ledger database queries
 */

export class StockRepository {
  /**
   * Create stock ledger entry
   */
  static async createEntry(
    userId: string,
    companyId: string | null,
    data: Partial<IStockLedger>
  ): Promise<IStockLedger> {
    const entry = new StockLedger({
      userId,
      ...(companyId ? { companyId: new mongoose.Types.ObjectId(companyId) } : {}),
      ...data,
    });
    return entry.save();
  }

  /**
   * Get stock ledger for a product
   */
  static async getProductLedger(
    userId: string,
    companyId: string | null,
    productId: string,
    skip: number = 0,
    limit: number = 100
  ) {
    const query: any = { userId, productId };
    if (companyId) {
      query.companyId = new mongoose.Types.ObjectId(companyId);
    }
    
    return StockLedger.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);
  }

  /**
   * Count ledger entries
   */
  static async countLedgerEntries(userId: string, companyId: string | null, productId: string) {
    const query: any = { userId, productId };
    if (companyId) {
      query.companyId = new mongoose.Types.ObjectId(companyId);
    }
    return StockLedger.countDocuments(query);
  }

  /**
   * Get stock summary
   */
  static async getStockSummary(userId: string, companyId: string | null, productId: string) {
    const matchStage: any = {
      userId: new mongoose.Types.ObjectId(userId),
      productId: new mongoose.Types.ObjectId(productId),
    };
    if (companyId) {
      matchStage.companyId = new mongoose.Types.ObjectId(companyId);
    }

    const result = await StockLedger.aggregate([
      { $match: matchStage },
      {
        $group: {
          _id: "$productId",
          totalIn: {
            $sum: {
              $cond: [
                { $in: ["$transactionType", ["purchase", "opening", "return"]] },
                "$quantity",
                0,
              ],
            },
          },
          totalOut: {
            $sum: {
              $cond: [
                { $in: ["$transactionType", ["sales"]] },
                "$quantity",
                0,
              ],
            },
          },
          adjustments: {
            $sum: {
              $cond: [
                { $eq: ["$transactionType", "adjustment"] },
                "$quantity",
                0,
              ],
            },
          },
        },
      },
    ]);

    return result.length > 0 ? result[0] : null;
  }

  /**
   * Delete ledger entry (usually not needed but for completeness)
   */
  static async deleteEntry(entryId: string, userId: string, companyId: string | null) {
    const query: any = { _id: entryId, userId };
    if (companyId) {
      query.companyId = companyId;
    }
    return StockLedger.findOneAndDelete(query);
  }
}
