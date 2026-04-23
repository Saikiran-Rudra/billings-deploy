"use client";

import { useState, useCallback } from "react";
import {
  getAllSuppliers,
  getSupplierById,
  createSupplier,
  updateSupplier,
  deleteSupplier,
} from "@/services/supplier.api";
import { Supplier, SupplierFormData } from "@/lib/validations/supplier";

export interface UseSupplierReturn {
  suppliers: Supplier[];
  loading: boolean;
  error: string | null;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };

  // Actions
  fetchSuppliers: (page?: number, limit?: number, search?: string) => Promise<void>;
  fetchSupplierById: (id: string) => Promise<Supplier | null>;
  createSupplier: (supplier: SupplierFormData) => Promise<Supplier>;
  updateSupplier: (id: string, supplier: Partial<SupplierFormData>) => Promise<Supplier>;
  deleteSupplier: (id: string) => Promise<void>;
  setError: (error: string | null) => void;
}

/**
 * Hook to manage supplier operations (CRUD)
 * Handles fetching, creating, updating, and deleting suppliers
 */
export const useSuppliers = (): UseSupplierReturn => {
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState<any>(undefined);

  const fetchSuppliers = useCallback(
    async (page = 1, limit = 20, search?: string) => {
      setLoading(true);
      setError(null);

      try {
        const response = await getAllSuppliers(page, limit, search);

        if (response.data) {
          setSuppliers(response.data);
          if (response.pagination) {
            setPagination(response.pagination);
          }
        }
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Failed to fetch suppliers";
        setError(errorMessage);
        console.error("Fetch Suppliers Error:", err);
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const fetchSupplierById = useCallback(
    async (id: string): Promise<Supplier | null> => {
      setLoading(true);
      setError(null);

      try {
        const supplier = await getSupplierById(id);
        return supplier;
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Failed to fetch supplier";
        setError(errorMessage);
        console.error("Fetch Supplier By ID Error:", err);
        return null;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const handleCreateSupplier = useCallback(
    async (supplier: SupplierFormData): Promise<Supplier> => {
      setLoading(true);
      setError(null);

      try {
        const newSupplier = await createSupplier(supplier);
        setSuppliers((prev) => [newSupplier, ...prev]);
        return newSupplier;
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Failed to create supplier";
        setError(errorMessage);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const handleUpdateSupplier = useCallback(
    async (id: string, supplier: Partial<SupplierFormData>): Promise<Supplier> => {
      setLoading(true);
      setError(null);

      try {
        const updatedSupplier = await updateSupplier(id, supplier);
        setSuppliers((prev) =>
          prev.map((s) => (s._id === id || s.id === id ? updatedSupplier : s))
        );
        return updatedSupplier;
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Failed to update supplier";
        setError(errorMessage);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const handleDeleteSupplier = useCallback(async (id: string): Promise<void> => {
    setLoading(true);
    setError(null);

    try {
      await deleteSupplier(id);
      setSuppliers((prev) => prev.filter((s) => s._id !== id && s.id !== id));
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to delete supplier";
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    suppliers,
    loading,
    error,
    pagination,
    fetchSuppliers,
    fetchSupplierById,
    createSupplier: handleCreateSupplier,
    updateSupplier: handleUpdateSupplier,
    deleteSupplier: handleDeleteSupplier,
    setError,
  };
};
