import { api } from "@/lib/api-client";

/**
 * Product API Service
 * Handles all product-related API calls
 */

interface Product {
  _id: string;
  productName: string;
  sku: string;
  category?: string;
}

interface ProductsListResponse {
  success: boolean;
  data: Product[];
  pagination?: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

interface NextSKUResponse {
  success: boolean;
  data: {
    sku: string;
  };
}

/**
 * Get all products for current company
 * @param page - Page number
 * @param limit - Items per page
 * @returns Array of products
 */
export const getAllProducts = async (
  page: number = 1,
  limit: number = 100
): Promise<Product[]> => {
  try {
    const response = await api.get<{
      products: Product[];
      pagination?: {
        page: number;
        limit: number;
        total: number;
        pages: number;
      };
    }>(`/products?page=${page}&limit=${limit}`);

    if (response.products && Array.isArray(response.products)) {
      return response.products;
    }

    throw new Error("Invalid response from products endpoint");
  } catch (error) {
    console.error("Error fetching products:", error);
    throw error;
  }
};

/**
 * Get next SKU for a given category
 * Auto-increments per category and company
 * 
 * @param category - Product category (e.g., "Electronics")
 * @returns Next SKU in format PREFIX-XXX (e.g., "ELE-001")
 */
export const getNextSKU = async (category: string): Promise<string> => {
  try {
    const response = await api.get<NextSKUResponse>(
      `/products/next-sku?category=${encodeURIComponent(category)}`
    );
    
    if (response.success && response.data?.sku) {
      return response.data.sku;
    }
    
    throw new Error("Invalid response from SKU generation endpoint");
  } catch (error) {
    console.error("Error fetching next SKU:", error);
    throw error;
  }
};
