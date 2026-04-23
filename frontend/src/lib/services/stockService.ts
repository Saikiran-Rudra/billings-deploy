/**
 * Stock API Service
 * Handles all stock-related API calls
 */

import { api } from "@/lib/api-client";

export interface StockLedger {
  _id: string;
  productId: string;
  transactionType: "opening" | "purchase" | "sales" | "return" | "adjustment";
  quantity: number;
  previousStock: number;
  newStock: number;
  reference?: string;
  reason?: string;
  notes?: string;
  createdAt: string;
}

export interface StockItem {
  _id: string;
  productName: string;
  sku: string;
  currentStock: number;
  minStock: number;
  category: string;
  lastUpdated: string;
  isLowStock: boolean;
}

export class StockAPI {
  /**
   * Get stock list
   */
  static async getStockList(page: number = 1, limit: number = 20, filters?: {
    search?: string;
    category?: string;
    lowStockOnly?: boolean;
  }) {
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
      });

      if (filters?.search) params.append("search", filters.search);
      if (filters?.category) params.append("category", filters.category);
      if (filters?.lowStockOnly) params.append("lowStockOnly", "true");

      const endpoint = `/stock/list?${params.toString()}`;
      console.log('[StockAPI] Fetching stock list:', { endpoint, filters });
      
      const result = await api.get<any>(endpoint);
      
      console.log('[StockAPI] Stock list response:', result);
      return result;
    } catch (error) {
      console.error('[StockAPI] Error fetching stock list:', error);
      throw error;
    }
  }

  /**
   * Get stock ledger for product
   */
  static async getStockLedger(productId: string, page: number = 1, limit: number = 50) {
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
      });

      const endpoint = `/stock/ledger/${productId}?${params}`;
      console.log('[StockAPI] Fetching stock ledger:', endpoint);
      
      const result = await api.get<{ ledger: StockLedger[]; pagination: { page: number; limit: number; total: number; pages: number } }>(endpoint);
      
      console.log('[StockAPI] Stock ledger response:', result);
      return result;
    } catch (error) {
      console.error('[StockAPI] Error fetching stock ledger:', error);
      throw error;
    }
  }

  /**
   * Adjust stock
   */
  static async adjustStock(data: {
    productId: string;
    adjustmentType: "increase" | "decrease";
    quantity: number;
    reason: string;
    notes?: string;
  }) {
    try {
      console.log('[StockAPI] Adjusting stock:', data);
      const result = await api.post<any>("/stock/adjust", data);
      console.log('[StockAPI] Adjust stock response:', result);
      return result;
    } catch (error) {
      console.error('[StockAPI] Error adjusting stock:', error);
      throw error;
    }
  }

  /**
   * Get low stock products
   */
  static async getLowStockProducts() {
    try {
      console.log('[StockAPI] Fetching low stock products');
      const result = await api.get<any>("/stock/low-stock");
      console.log('[StockAPI] Low stock products response:', result);
      return result;
    } catch (error) {
      console.error('[StockAPI] Error fetching low stock products:', error);
      throw error;
    }
  }

  /**
   * Get stock summary by category
   */
  static async getStockSummaryByCategory() {
    try {
      console.log('[StockAPI] Fetching stock summary by category');
      const result = await api.get<any>("/stock/summary-by-category");
      console.log('[StockAPI] Stock summary response:', result);
      return result;
    } catch (error) {
      console.error('[StockAPI] Error fetching stock summary:', error);
      throw error;
    }
  }

  /**
   * Generate stock report
   */
  static async generateStockReport() {
    try {
      console.log('[StockAPI] Generating stock report');
      const result = await api.get<any>("/stock/report");
      console.log('[StockAPI] Stock report response:', result);
      return result;
    } catch (error) {
      console.error('[StockAPI] Error generating stock report:', error);
      throw error;
    }
  }
}
