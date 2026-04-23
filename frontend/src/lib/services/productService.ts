/**
 * Product API Service
 * Handles all product-related API calls
 */

import { api } from "@/lib/api-client";

export interface Product {
  _id: string;
  productName: string;
  sku: string;
  category: string;
  unit: string;
  salePrice: number;
  purchasePrice: number;
  openingStock: number;
  currentStock: number;
  minStock: number;
  gst: number;
  description?: string;
  location?: string;
  status: "active" | "inactive";
  createdAt: string;
  updatedAt: string;
}

export interface ProductConfig {
  categories: string[];
  units: string[];
  gstRates: number[];
  sku: {
    prefix: string;
    sequence: number;
  };
  defaultHSN: string;
  allowNegativeStock: boolean;
  lowStockThreshold: number;
}

export class ProductAPI {
  /**
   * Get all products
   */
  static async getProducts(page: number = 1, limit: number = 20, filters?: {
    search?: string;
    category?: string;
    minPrice?: number;
    maxPrice?: number;
  }) {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
    });

    if (filters?.search) params.append("search", filters.search);
    if (filters?.category) params.append("category", filters.category);
    if (filters?.minPrice) params.append("minPrice", filters.minPrice.toString());
    if (filters?.maxPrice) params.append("maxPrice", filters.maxPrice.toString());

    return api.get<any>(`/products?${params.toString()}`);
  }

  /**
   * Get product by ID
   */
  static async getProduct(id: string) {
    return api.get<Product>(`/products/${id}`);
  }

  /**
   * Create product
   */
  static async createProduct(data: Partial<Product>) {
    return api.post<Product>("/products", data);
  }

  /**
   * Update product
   */
  static async updateProduct(id: string, data: Partial<Product>) {
    return api.put<Product>(`/products/${id}`, data);
  }

  /**
   * Delete product
   */
  static async deleteProduct(id: string) {
    return api.delete(`/products/${id}`);
  }
}

export class ProductConfigAPI {
  /**
   * Get product configuration
   */
  static async getConfig() {
    return api.get<{ config: ProductConfig }>("/config/products");
  }

  /**
   * Update product configuration
   */
  static async updateConfig(config: Partial<ProductConfig>) {
    return api.put<{ config: ProductConfig }>("/config/products", config);
  }

  /**
   * Add category
   */
  static async addCategory(category: string) {
    return api.post<any>("/config/products/categories", { category });
  }

  /**
   * Remove category
   */
  static async removeCategory(category: string) {
    return api.delete(`/config/products/categories/${category}`);
  }

  /**
   * Add unit
   */
  static async addUnit(unit: string) {
    return api.post<any>("/config/products/units", { unit });
  }

  /**
   * Remove unit
   */
  static async removeUnit(unit: string) {
    return api.delete(`/config/products/units/${unit}`);
  }

  /**
   * Update GST rates
   */
  static async updateGstRates(rates: number[]) {
    return api.put<any>("/config/products/gst-rates", { rates });
  }

  /**
   * Update SKU settings
   */
  static async updateSkuSettings(prefix: string, sequence: number) {
    return api.put<any>("/config/products/sku-settings", { prefix, sequence });
  }
}
