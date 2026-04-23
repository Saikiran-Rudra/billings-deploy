"use client";

import { useState, useCallback } from "react";
import {
  getAllPurchases,
  getPurchaseById,
  createPurchase,
  updatePurchase,
  deletePurchase,
} from "@/services/purchase.api";
import { Purchase, PurchaseFormData } from "@/lib/validations/purchase";

export interface UsePurchaseReturn {
  purchases: Purchase[];
  loading: boolean;
  error: string | null;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };

  // Actions
  fetchPurchases: (
    page?: number,
    limit?: number,
    search?: string,
    status?: string
  ) => Promise<void>;
  fetchPurchaseById: (id: string) => Promise<Purchase | null>;
  createPurchase: (purchase: PurchaseFormData) => Promise<Purchase>;
  updatePurchase: (
    id: string,
    purchase: Partial<PurchaseFormData>
  ) => Promise<Purchase>;
  deletePurchase: (id: string) => Promise<void>;
  setError: (error: string | null) => void;
}

/**
 * Hook to manage purchase operations (CRUD)
 * Handles fetching, creating, updating, and deleting purchases
 */
export const usePurchases = (): UsePurchaseReturn => {
  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState<any>(undefined);

  const fetchPurchases = useCallback(
    async (page = 1, limit = 20, search?: string, status?: string) => {
      setLoading(true);
      setError(null);

      try {
        const response = await getAllPurchases(page, limit, search, status);

        if (response.data) {
          setPurchases(response.data);
          if (response.pagination) {
            setPagination(response.pagination);
          }
        }
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Failed to fetch purchases";
        setError(errorMessage);
        console.error("Fetch Purchases Error:", err);
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const fetchPurchaseById = useCallback(
    async (id: string): Promise<Purchase | null> => {
      setLoading(true);
      setError(null);

      try {
        const purchase = await getPurchaseById(id);
        return purchase;
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Failed to fetch purchase";
        setError(errorMessage);
        console.error("Fetch Purchase By ID Error:", err);
        return null;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const handleCreatePurchase = useCallback(
    async (purchase: PurchaseFormData): Promise<Purchase> => {
      setLoading(true);
      setError(null);

      try {
        const newPurchase = await createPurchase(purchase);
        setPurchases((prev) => [newPurchase, ...prev]);
        return newPurchase;
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Failed to create purchase";
        setError(errorMessage);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const handleUpdatePurchase = useCallback(
    async (
      id: string,
      purchase: Partial<PurchaseFormData>
    ): Promise<Purchase> => {
      setLoading(true);
      setError(null);

      try {
        const updatedPurchase = await updatePurchase(id, purchase);
        setPurchases((prev) =>
          prev.map((p) =>
            p._id === id || p.id === id ? updatedPurchase : p
          )
        );
        return updatedPurchase;
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Failed to update purchase";
        setError(errorMessage);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const handleDeletePurchase = useCallback(async (id: string): Promise<void> => {
    setLoading(true);
    setError(null);

    try {
      await deletePurchase(id);
      setPurchases((prev) => prev.filter((p) => p._id !== id && p.id !== id));
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to delete purchase";
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    purchases,
    loading,
    error,
    pagination,
    fetchPurchases,
    fetchPurchaseById,
    createPurchase: handleCreatePurchase,
    updatePurchase: handleUpdatePurchase,
    deletePurchase: handleDeletePurchase,
    setError,
  };
};
