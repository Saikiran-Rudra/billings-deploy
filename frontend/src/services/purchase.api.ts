import { api } from "@/lib/api-client";
import { Purchase, PurchaseFormData } from "@/lib/validations/purchase";

interface PurchasesListResponse {
  success: boolean;
  data: Purchase[];
  pagination?: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

interface PurchaseResponse {
  success: boolean;
  data: Purchase;
  message?: string;
}

/**
 * Get all purchases for current company
 */
export const getAllPurchases = async (
  page?: number,
  limit?: number,
  search?: string,
  status?: string
): Promise<PurchasesListResponse> => {
  try {
    const query = new URLSearchParams();
    if (page) query.append("page", page.toString());
    if (limit) query.append("limit", limit.toString());
    if (search) query.append("search", search);
    if (status) query.append("status", status);

    const response = await api.get<PurchasesListResponse>(
      `/purchases?${query.toString()}`
    );

    return response;
  } catch (error) {
    console.error("Error fetching purchases:", error);
    throw error;
  }
};

/**
 * Get purchase by ID
 */
export const getPurchaseById = async (id: string): Promise<Purchase> => {
  try {
    const response = await api.get<PurchaseResponse>(`/purchases/${id}`);

    if (response.success && response.data) {
      return response.data;
    }

    throw new Error("Invalid response from get purchase endpoint");
  } catch (error) {
    console.error("Error fetching purchase:", error);
    throw error;
  }
};

/**
 * Create new purchase
 */
export const createPurchase = async (
  purchase: PurchaseFormData
): Promise<Purchase> => {
  try {
    const response = await api.post<PurchaseResponse>("/purchases", purchase);

    if (response.success && response.data) {
      return response.data;
    }

    throw new Error("Invalid response from create purchase endpoint");
  } catch (error) {
    console.error("Error creating purchase:", error);
    throw error;
  }
};

/**
 * Update purchase by ID
 */
export const updatePurchase = async (
  id: string,
  purchase: Partial<PurchaseFormData>
): Promise<Purchase> => {
  try {
    const response = await api.put<PurchaseResponse>(
      `/purchases/${id}`,
      purchase
    );

    if (response.success && response.data) {
      return response.data;
    }

    throw new Error("Invalid response from update purchase endpoint");
  } catch (error) {
    console.error("Error updating purchase:", error);
    throw error;
  }
};

/**
 * Delete purchase by ID
 */
export const deletePurchase = async (id: string): Promise<void> => {
  try {
    const response = await api.delete<PurchaseResponse>(`/purchases/${id}`);

    if (!response.success) {
      throw new Error("Failed to delete purchase");
    }
  } catch (error) {
    console.error("Error deleting purchase:", error);
    throw error;
  }
};
