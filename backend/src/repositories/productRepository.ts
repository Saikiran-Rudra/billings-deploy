import Product, { IProduct } from "../models/Product.js";
import { CreateProductInput } from "../validators/productValidator.js";
import mongoose from "mongoose";

/**
 * Product Repository
 * Handles all database queries for products
 */

export class ProductRepository {
  /**
   * Find all products with pagination and filters
   */
  static async findWithFilters(
    userId: string,
    filter: Record<string, unknown>,
    skip: number,
    limit: number
  ) {
    return Product.find(filter)
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 });
  }

  /**
   * Count documents matching filter
   */
  static async countByFilter(filter: Record<string, unknown>) {
    return Product.countDocuments(filter);
  }

  /**
   * Find product by ID
   */
  static async findById(productId: string, userId: string) {
    return Product.findOne({ _id: productId, userId });
  }

  /**
   * Find product by SKU
   */
  static async findBySKU(sku: string, userId: string) {
    return Product.findOne({ sku, userId });
  }

  /**
   * Find multiple products by IDs
   */
  static async findByIds(productIds: string[], userId: string) {
    return Product.find({ _id: { $in: productIds }, userId });
  }

  /**
   * Create product
   */
  static async create(
    userId: string,
    data: CreateProductInput & { currentStock?: number }
  ): Promise<IProduct> {
    const product = new Product({
      userId,
      ...data,
      currentStock: data.currentStock || 0,
    });
    return product.save();
  }

  /**
   * Update product
   */
  static async update(
    productId: string,
    userId: string,
    data: Partial<IProduct>
  ): Promise<IProduct | null> {
    return Product.findOneAndUpdate(
      { _id: productId, userId },
      data,
      { new: true }
    );
  }

  /**
   * Update stock
   */
  static async updateStock(
    productId: string,
    userId: string,
    newStock: number
  ): Promise<IProduct | null> {
    return Product.findOneAndUpdate(
      { _id: productId, userId },
      { currentStock: newStock },
      { new: true }
    );
  }

  /**
   * Delete product
   */
  static async delete(productId: string, userId: string) {
    return Product.findOneAndDelete({ _id: productId, userId });
  }

  /**
   * Get stock details
   */
  static async getStockInfo(productId: string, userId: string) {
    return Product.findOne(
      { _id: productId, userId },
      { currentStock: 1 }
    );
  }

  /**
   * Find last product with SKU prefix (for category-based SKU generation)
   * Used to determine next SKU number
   */
  static async findLastBySkuPrefix(skuPrefix: string, companyId: string) {
    const companyObjectId = new mongoose.Types.ObjectId(companyId);
    // Escape regex special characters in prefix
    const escapedPrefix = skuPrefix.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    return Product.findOne(
      {
        companyId: companyObjectId,
        sku: { $regex: `^${escapedPrefix}-`, $options: "i" },
      },
      { sku: 1 }
    ).sort({ sku: -1 });
  }
}
