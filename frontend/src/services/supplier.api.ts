import { api } from "@/lib/api-client";
import { Supplier, SupplierFormData } from "@/lib/validations/supplier";

interface SuppliersListResponse {
  success: boolean;
  data: Supplier[];
  pagination?: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

interface SupplierResponse {
  success: boolean;
  data: Supplier;
}

/**
 * Get all suppliers for current company
 */
export const getAllSuppliers = async (
  page?: number,
  limit?: number,
  search?: string
): Promise<SuppliersListResponse> => {
  try {
    const query = new URLSearchParams();
    if (page) query.append("page", page.toString());
    if (limit) query.append("limit", limit.toString());
    if (search) query.append("search", search);

    const response = await api.get<SuppliersListResponse>(
      `/suppliers?${query.toString()}`
    );

    return response;
  } catch (error) {
    console.error("Error fetching suppliers:", error);
    throw error;
  }
};

/**
 * Get supplier by ID
 */
export const getSupplierById = async (id: string): Promise<Supplier> => {
  try {
    const response = await api.get<SupplierResponse>(`/suppliers/${id}`);

    if (response.success && response.data) {
      return response.data;
    }

    throw new Error("Invalid response from get supplier endpoint");
  } catch (error) {
    console.error("Error fetching supplier:", error);
    throw error;
  }
};

/**
 * Create new supplier
 */
export const createSupplier = async (
  supplier: SupplierFormData
): Promise<Supplier> => {
  try {
    const response = await api.post<SupplierResponse>("/suppliers", supplier);

    if (response.success && response.data) {
      return response.data;
    }

    throw new Error("Invalid response from create supplier endpoint");
  } catch (error) {
    console.error("Error creating supplier:", error);
    throw error;
  }
};

/**
 * Update supplier by ID
 */
export const updateSupplier = async (
  id: string,
  supplier: Partial<SupplierFormData>
): Promise<Supplier> => {
  try {
    const response = await api.put<SupplierResponse>(
      `/suppliers/${id}`,
      supplier
    );

    if (response.success && response.data) {
      return response.data;
    }

    throw new Error("Invalid response from update supplier endpoint");
  } catch (error) {
    console.error("Error updating supplier:", error);
    throw error;
  }
};

/**
 * Delete supplier by ID (soft delete)
 */
export const deleteSupplier = async (id: string): Promise<void> => {
  try {
    await api.delete(`/suppliers/${id}`);
  } catch (error) {
    console.error("Error deleting supplier:", error);
    throw error;
  }
};
