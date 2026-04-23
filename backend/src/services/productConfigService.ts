import ProductConfig, { IProductConfig } from "../models/ProductConfig.js";
import { DEFAULT_PRODUCT_CONFIG, ProductConfig as ProductConfigType } from "../config/product.config.js";

/**
 * Product Config Service
 * Business logic for product configuration
 */

export class ProductConfigService {
  /**
   * Get or create config for user
   */
  static async getOrCreateConfig(userId: string): Promise<IProductConfig> {
    let config = await ProductConfig.findOne({ userId });

    if (!config) {
      // Create new config with defaults
      config = new ProductConfig({
        userId,
        ...DEFAULT_PRODUCT_CONFIG,
      });
      await config.save();
    }

    return config;
  }

  /**
   * Get config
   */
  static async getConfig(userId: string): Promise<IProductConfig | null> {
    return ProductConfig.findOne({ userId });
  }

  /**
   * Add new category
   */
  static async addCategory(userId: string, category: string): Promise<IProductConfig | null> {
    const config = await ProductConfig.findOne({ userId });
    if (!config) return null;

    if (!config.categories.includes(category)) {
      config.categories.push(category);
      await config.save();
    }

    return config;
  }

  /**
   * Remove category
   */
  static async removeCategory(userId: string, category: string): Promise<IProductConfig | null> {
    return ProductConfig.findOneAndUpdate(
      { userId },
      { $pull: { categories: category } },
      { new: true }
    );
  }

  /**
   * Add new unit
   */
  static async addUnit(userId: string, unit: string): Promise<IProductConfig | null> {
    const config = await ProductConfig.findOne({ userId });
    if (!config) return null;

    if (!config.units.includes(unit)) {
      config.units.push(unit);
      await config.save();
    }

    return config;
  }

  /**
   * Remove unit
   */
  static async removeUnit(userId: string, unit: string): Promise<IProductConfig | null> {
    return ProductConfig.findOneAndUpdate(
      { userId },
      { $pull: { units: unit } },
      { new: true }
    );
  }

  /**
   * Update GST rates
   */
  static async updateGstRates(userId: string, rates: number[]): Promise<IProductConfig | null> {
    return ProductConfig.findOneAndUpdate(
      { userId },
      { gstRates: rates },
      { new: true }
    );
  }

  /**
   * Update SKU settings
   */
  static async updateSkuSettings(
    userId: string,
    prefix: string,
    sequence: number
  ): Promise<IProductConfig | null> {
    return ProductConfig.findOneAndUpdate(
      { userId },
      {
        "sku.prefix": prefix,
        "sku.sequence": sequence,
      },
      { new: true }
    );
  }

  /**
   * Increment SKU sequence and get next SKU
   */
  static async getNextSKU(userId: string): Promise<string> {
    const config = await ProductConfig.findOneAndUpdate(
      { userId },
      { $inc: { "sku.sequence": 1 } },
      { new: true }
    );

    if (!config) {
      throw new Error("Product config not found for user");
    }

    return `${config.sku.prefix}-${config.sku.sequence}`;
  }

  /**
   * Update all config
   */
  static async updateConfig(
    userId: string,
    data: Partial<ProductConfigType>
  ): Promise<IProductConfig | null> {
    return ProductConfig.findOneAndUpdate(
      { userId },
      data,
      { new: true }
    );
  }
}
