"use client";

import { useState, useCallback } from "react";
import { getNextSKU } from "@/services/product.api";

interface UseSkuGeneratorReturn {
  sku: string;
  isLoading: boolean;
  error: string | null;
  generateSKU: (category: string) => Promise<void>;
  resetSKU: () => void;
}

/**
 * Hook for dynamic SKU generation
 * 
 * Usage:
 * const { sku, isLoading, error, generateSKU } = useSkuGenerator();
 * 
 * When category changes:
 * await generateSKU("Electronics"); // sku becomes "ELE-001"
 */
export const useSkuGenerator = (): UseSkuGeneratorReturn => {
  const [sku, setSKU] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const generateSKU = useCallback(async (category: string) => {
    if (!category || category.trim() === "") {
      setError("Category is required");
      setSKU("");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const nextSKU = await getNextSKU(category);
      setSKU(nextSKU);
      setError(null);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to generate SKU";
      setError(errorMessage);
      setSKU("");
      console.error("SKU Generation Error:", err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const resetSKU = useCallback(() => {
    setSKU("");
    setError(null);
  }, []);

  return {
    sku,
    isLoading,
    error,
    generateSKU,
    resetSKU,
  };
};
