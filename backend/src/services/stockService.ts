import { StockRepository } from "../repositories/stockRepository.js";
import { ProductRepository } from "../repositories/productRepository.js";
import { ProductConfigService } from "./productConfigService.js";
import Product from "../models/Product.js";
import mongoose from "mongoose";

/**
 * Stock Service
 * Business logic for stock management and ledger
 */

export class StockService {
  /**
   * Get stock list with pagination
   */
  static async getStockList(
    userId: string,
    companyId: string | null,
    page: number = 1,
    limit: number = 20,
    filters: {
      search?: string;
      category?: string;
      lowStockOnly?: boolean;
    } = {}
  ) {
    const skip = (page - 1) * limit;
    const lowStockThreshold = 10; // Default threshold

    try {
      // Build basic query - filter only by companyId (all users in same company can see products)
      const query: any = {};
      
      // Only filter by companyId if it's not null (null = superadmin, can see all companies)
      if (companyId) {
        query.companyId = new mongoose.Types.ObjectId(companyId);
      }
      
      // Add category filter if provided
      if (filters.category) {
        query.category = filters.category;
      }
      
      // Add search filter if provided
      if (filters.search) {
        query.$or = [
          { productName: { $regex: filters.search, $options: "i" } },
          { sku: { $regex: filters.search, $options: "i" } },
        ];
      }
      
      // Add low stock filter if provided
      if (filters.lowStockOnly) {
        query.currentStock = { $lte: lowStockThreshold };
      }

      console.log("[StockService.getStockList] Query:", query);

      const [products, total] = await Promise.all([
        Product.find(query)
          .select("productName sku currentStock category updatedAt")
          .skip(skip)
          .limit(limit)
          .sort({ updatedAt: -1 }),
        Product.countDocuments(query),
      ]);

      console.log("[StockService.getStockList] Found products:", products.length, "total:", total);

      return {
        products: products.map((p: any) => ({
          _id: p._id,
          productName: p.productName,
          sku: p.sku,
          currentStock: p.currentStock,
          category: p.category,
          lastUpdated: p.updatedAt,
          isLowStock: p.currentStock <= lowStockThreshold,
        })),
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit),
        },
      };
    } catch (error) {
      console.error("[StockService.getStockList] Error:", error);
      throw error;
    }
  }

  /**
   * Get stock ledger for product
   */
  static async getProductStockLedger(
    userId: string,
    companyId: string | null,
    productId: string,
    page: number = 1,
    limit: number = 50
  ) {
    const skip = (page - 1) * limit;

    const [ledger, total] = await Promise.all([
      StockRepository.getProductLedger(userId, companyId, productId, skip, limit),
      StockRepository.countLedgerEntries(userId, companyId, productId),
    ]);

    return {
      ledger,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Get products below minimum stock
   */
  static async getLowStockProducts(userId: string, companyId: string | null) {
    const query: any = {};
    
    if (companyId) {
      query.companyId = new mongoose.Types.ObjectId(companyId);
    }
    
    // Without minStock field, return all products with current stock
    return Product.find(query)
      .select("productName sku currentStock category")
      .sort({ currentStock: 1 });
  }

  /**
   * Get stock summary by category
   */
  static async getStockSummaryByCategory(userId: string, companyId: string | null) {
    const matchStage: any = {};
    if (companyId) {
      matchStage.companyId = new mongoose.Types.ObjectId(companyId);
    }
    
    return Product.aggregate([
      { $match: matchStage },
      {
        $group: {
          _id: "$category",
          totalProducts: { $sum: 1 },
          totalStock: { $sum: "$currentStock" },
          totalValue: {
            $sum: { $multiply: ["$currentStock", "$salePrice"] },
          },
          avgStock: { $avg: "$currentStock" },
        },
      },
      { $sort: { _id: 1 } },
    ]);
  }

  /**
   * Generate stock report
   */
  static async generateStockReport(userId: string, companyId: string | null) {
    const matchStage: any = {};
    if (companyId) {
      matchStage.companyId = new mongoose.Types.ObjectId(companyId);
    }

    const stats = await Product.aggregate([
      { $match: matchStage },
      {
        $group: {
          _id: null,
          totalProducts: { $sum: 1 },
          totalStock: { $sum: "$currentStock" },
          totalValue: {
            $sum: { $multiply: ["$currentStock", "$salePrice"] },
          },
          avgStock: { $avg: "$currentStock" },
          minStock: { $min: "$currentStock" },
          maxStock: { $max: "$currentStock" },
        },
      },
    ]);

    const countQuery: any = {};
    if (companyId) {
      countQuery.companyId = new mongoose.Types.ObjectId(companyId);
    }

    // Without minStock field, count products with 0 or very low stock
    const lowStockCount = await Product.countDocuments({
      ...countQuery,
      currentStock: { $lt: 5 },
    });

    return {
      ...stats[0],
      lowStockProducts: lowStockCount,
    };
  }
}
