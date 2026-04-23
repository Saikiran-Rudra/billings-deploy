import { ProductRepository } from "../repositories/productRepository.js";
import { StockRepository } from "../repositories/stockRepository.js";
import { ProductConfigService } from "./productConfigService.js";
import { CreateProductInput, UpdateProductInput } from "../validators/productValidator.js";
import mongoose from "mongoose";

/**
 * Product Service
 * Contains all business logic for products
 */

export class ProductService {
  /**
   * Create product with auto-generated SKU
   */
  static async createProduct(userId: string, data: CreateProductInput) {
    // Get next SKU if not provided
    let sku = data.sku;
    if (!sku) {
      sku = await ProductConfigService.getNextSKU(userId);
    } else {
      // Check if SKU already exists
      const existing = await ProductRepository.findBySKU(sku, userId);
      if (existing) {
        throw new Error("SKU already exists");
      }
    }

    // Create product
    const product = await ProductRepository.create(userId, {
      ...data,
      sku,
      currentStock: data.openingStock || 0,
    });

    // Create opening stock ledger entry if opening stock > 0
    if (data.openingStock && data.openingStock > 0) {
      await StockRepository.createEntry(userId, data.companyId, {
        productId: product._id,
        transactionType: "opening",
        quantity: data.openingStock,
        previousStock: 0,
        newStock: data.openingStock,
        notes: "Opening stock",
      });
    }

    return product;
  }

  /**
   * Update product
   */
  static async updateProduct(
    userId: string,
    productId: string,
    data: UpdateProductInput,
    companyId: string
  ) {
    // Check if SKU is being changed to an existing one
    if (data.sku) {
      const existing = await ProductRepository.findBySKU(data.sku, userId);
      if (existing && existing._id.toString() !== productId) {
        throw new Error("SKU already exists");
      }
    }

    // Remove companyId from update data (it's immutable) and cast to any to avoid type issues
    const updateData = { ...data };
    delete updateData.companyId;

    const product = await ProductRepository.update(productId, userId, updateData as any);
    if (!product || product.companyId.toString() !== companyId) {
      throw new Error("Product not found");
    }

    return product;
  }

  /**
   * Get products with filters
   */
  static async getProducts(
    userId: string,
    page: number = 1,
    limit: number = 20,
    filters: {
      search?: string;
      category?: string;
      status?: string;
      minPrice?: number;
      maxPrice?: number;
    } = {},
    companyId?: string
  ) {
    const skip = (page - 1) * limit;
    // Only filter by companyId for data isolation - all company users can see products
    const filter: Record<string, unknown> = companyId 
      ? { companyId: new mongoose.Types.ObjectId(companyId) }
      : { userId };

    // Add filters
    if (filters.search) {
      filter.$or = [
        { productName: { $regex: filters.search, $options: "i" } },
        { sku: { $regex: filters.search, $options: "i" } },
      ];
    }

    if (filters.category) {
      filter.category = filters.category;
    }

    if (filters.status) {
      filter.status = filters.status;
    }

    if (filters.minPrice !== undefined || filters.maxPrice !== undefined) {
      filter.salePrice = {};
      if (filters.minPrice !== undefined) {
        (filter.salePrice as Record<string, unknown>).$gte = filters.minPrice;
      }
      if (filters.maxPrice !== undefined) {
        (filter.salePrice as Record<string, unknown>).$lte = filters.maxPrice;
      }
    }

    const [products, total] = await Promise.all([
      ProductRepository.findWithFilters(userId, filter, skip, limit),
      ProductRepository.countByFilter(filter),
    ]);

    return {
      products,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Get product by ID
   */
  static async getProductById(userId: string, productId: string, companyId: string) {
    const product = await ProductRepository.findById(productId, userId);
    if (!product || product.companyId.toString() !== companyId) {
      throw new Error("Product not found");
    }
    return product;
  }

  /**
   * Delete product
   */
  static async deleteProduct(userId: string, productId: string, companyId: string) {
    const product = await ProductRepository.delete(productId, userId);
    if (!product || product.companyId.toString() !== companyId) {
      throw new Error("Product not found");
    }
    return product;
  }

  /**
   * Update stock without creating ledger (for auto updates from invoice/purchase)
   * Used internally by invoice and purchase modules
   * DEPRECATED: Use atomicDecreaseStock/atomicIncreaseStock from stockOperations instead
   */
  static async updateStockInternal(
    userId: string,
    productId: string,
    newStock: number,
    transactionType: "purchase" | "sales" | "return",
    reference?: string,
    companyId?: string
  ) {
    const product = await ProductRepository.findById(productId, userId);
    if (!product) {
      throw new Error("Product not found");
    }

    const company = companyId || product.companyId.toString();
    const previousStock = product.currentStock;

    // Update product stock
    await ProductRepository.updateStock(productId, userId, newStock);

    // Create ledger entry
    const quantity = newStock - previousStock;
    await StockRepository.createEntry(userId, company, {
      productId: new mongoose.Types.ObjectId(productId),
      transactionType,
      quantity,
      previousStock,
      newStock,
      reference,
    });
  }

  /**
   * Update stock from invoice (decrease stock for sales)
   * Called when invoice is created/finalized
   * Only applies to products, not services
   */
  static async updateStockFromInvoice(
    userId: string,
    lineItems: Array<{
      productId: string;
      quantity: number;
    }>,
    invoiceId: string,
    allowNegative: boolean = false
  ) {
    for (const item of lineItems) {
      const product = await ProductRepository.findById(item.productId, userId);
      // Only update stock if it's a product (not a service)
      if (product && product.productType === "goods") {
        const { atomicDecreaseStock } = await import("../utils/stockOperations.js");
        await atomicDecreaseStock(
          item.productId,
          userId,
          item.quantity,
          allowNegative,
          "sales",
          invoiceId
        );
      }
    }
  }

  /**
   * Update stock from sales return (increase stock for returns)
   * Called when sales return is processed
   * Only applies to products, not services
   */
  static async updateStockFromSalesReturn(
    userId: string,
    lineItems: Array<{
      productId: string;
      quantity: number;
    }>,
    salesReturnId: string
  ) {
    for (const item of lineItems) {
      const product = await ProductRepository.findById(item.productId, userId);
      // Only update stock if it's a product (not a service)
      if (product && product.productType === "goods") {
        const { atomicIncreaseStock } = await import("../utils/stockOperations.js");
        await atomicIncreaseStock(
          item.productId,
          userId,
          item.quantity,
          "return",
          salesReturnId
        );
      }
    }
  }

  /**
   * Get stock information
   */
  static async getStockInfo(userId: string, productId: string) {
    const stockInfo = await ProductRepository.getStockInfo(productId, userId);
    if (!stockInfo) {
      throw new Error("Product not found");
    }
    return stockInfo;
  }
}
