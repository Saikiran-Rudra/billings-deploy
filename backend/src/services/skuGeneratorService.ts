import mongoose from "mongoose";
import { ProductRepository } from "../repositories/productRepository.js";

interface SKUGeneratorOptions {
  productType: "goods" | "service";
  categoryCode: string;
  categoryName: string;
}

interface SKUCounter {
  _id: string;
  type: "GDS" | "SRV";
  categoryCode: string;
  sequence: number;
}

// Map product type to SKU type code
const typeCodeMap = {
  goods: "GDS",
  service: "SRV",
};

// Generate category code from category name (e.g., "Electronics" -> "ELEC")
const generateCategoryCode = (categoryName: string): string => {
  if (!categoryName) return "MISC";
  
  // Remove spaces and take first 4 letters, uppercase
  const cleaned = categoryName.replace(/\s+/g, "").toUpperCase();
  return cleaned.substring(0, 4);
};

// Get or create MongoDB connection for counters
const getCountersCollection = async () => {
  const db = mongoose.connection;
  return db.collection("sku_counters");
};

export const SKUGeneratorService = {
  /**
   * Generate next SKU for a given product type and category
   * Format: PRD-{TYPE}-{CATEGORY_CODE}-{SEQUENCE}
   * Example: PRD-GDS-MOB-0001
   */
  generateSKU: async (options: SKUGeneratorOptions): Promise<string> => {
    try {
      const countersCollection = await getCountersCollection();
      const typeCode = typeCodeMap[options.productType];
      const categoryCode = options.categoryCode || generateCategoryCode(options.categoryName);
      
      // Create unique ID for this type+category combination
      const counterId = `${typeCode}-${categoryCode}`;
      
      // Atomically increment counter and get new value
      const result = await countersCollection.findOneAndUpdate(
        { _id: counterId } as any,
        { $inc: { sequence: 1 } },
        { upsert: true, returnDocument: "after" }
      );
      
      const sequence = result?.value?.sequence || 1;
      const paddedSequence = String(sequence).padStart(4, "0");
      
      return `PRD-${typeCode}-${categoryCode}-${paddedSequence}`;
    } catch (error) {
      console.error("Error generating SKU:", error);
      throw new Error("Failed to generate SKU");
    }
  },

  /**
   * Validate SKU format
   */
  validateSKUFormat: (sku: string): boolean => {
    const skuPattern = /^PRD-(GDS|SRV)-[A-Z0-9]{2,4}-\d{4,}$/;
    return skuPattern.test(sku);
  },

  /**
   * Check if SKU is unique in database
   */
  checkSKUUniqueness: async (sku: string, excludeId?: string): Promise<boolean> => {
    try {
      const Product = await require("../models/Product").default;
      const query: any = { sku };
      
      if (excludeId) {
        query._id = { $ne: excludeId };
      }
      
      const existing = await Product.findOne(query);
      return !existing;
    } catch (error) {
      console.error("Error checking SKU uniqueness:", error);
      throw new Error("Failed to validate SKU uniqueness");
    }
  },

  /**
   * Generate category code from category name
   */
  generateCategoryCode: generateCategoryCode,

  /**
   * Generate simple category-based SKU (CATEGORY-XXX format)
   * Example: ELE-001, FUR-002
   * 
   * @param category - Category name (e.g., "Electronics")
   * @param companyId - Company ID for SKU uniqueness
   * @returns Next SKU in format PREFIX-XXX
   */
  generateSimpleSKU: async (category: string, companyId: string): Promise<string> => {
    try {
      // Generate 3-letter prefix from category (first 3 letters, uppercase)
      const prefix = category
        .trim()
        .toUpperCase()
        .replace(/\s+/g, "")
        .substring(0, 3);

      if (!prefix || prefix.length === 0) {
        throw new Error("Invalid category for SKU generation");
      }

      // Find last product with same prefix for this company
      const lastProduct = await ProductRepository.findLastBySkuPrefix(prefix, companyId);

      let nextNumber = 1;
      if (lastProduct && lastProduct.sku) {
        // Extract number from SKU (e.g., "ELE-005" -> 5)
        const match = lastProduct.sku.match(/-(\d+)$/);
        if (match) {
          nextNumber = parseInt(match[1]) + 1;
        }
      }

      // Pad number to 3 digits (001, 002, etc.)
      const paddedNumber = String(nextNumber).padStart(3, "0");
      return `${prefix}-${paddedNumber}`;
    } catch (error) {
      console.error("Error generating simple SKU:", error);
      throw new Error("Failed to generate SKU");
    }
  },
};
