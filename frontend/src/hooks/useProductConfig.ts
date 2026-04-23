/**
 * useProductConfig Hook
 * Manages product configuration state and API calls
 */

import { useEffect, useState } from "react";
import { ProductConfigAPI, ProductConfig } from "@/lib/services/productService";

interface UseProductConfigReturn {
  config: ProductConfig | null;
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  addCategory: (category: string) => Promise<void>;
  removeCategory: (category: string) => Promise<void>;
  addUnit: (unit: string) => Promise<void>;
  removeUnit: (unit: string) => Promise<void>;
  updateGstRates: (rates: number[]) => Promise<void>;
  updateSkuSettings: (prefix: string, sequence: number) => Promise<void>;
}

export function useProductConfig(): UseProductConfigReturn {
  const [config, setConfig] = useState<ProductConfig | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchConfig = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await ProductConfigAPI.getConfig();
      setConfig(response.config);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to load config";
      setError(message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchConfig();
  }, []);

  const handleAddCategory = async (category: string) => {
    try {
      setError(null);
      await ProductConfigAPI.addCategory(category);
      await fetchConfig();
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to add category";
      setError(message);
      throw err;
    }
  };

  const handleRemoveCategory = async (category: string) => {
    try {
      setError(null);
      await ProductConfigAPI.removeCategory(category);
      await fetchConfig();
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to remove category";
      setError(message);
      throw err;
    }
  };

  const handleAddUnit = async (unit: string) => {
    try {
      setError(null);
      await ProductConfigAPI.addUnit(unit);
      await fetchConfig();
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to add unit";
      setError(message);
      throw err;
    }
  };

  const handleRemoveUnit = async (unit: string) => {
    try {
      setError(null);
      await ProductConfigAPI.removeUnit(unit);
      await fetchConfig();
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to remove unit";
      setError(message);
      throw err;
    }
  };

  const handleUpdateGstRates = async (rates: number[]) => {
    try {
      setError(null);
      await ProductConfigAPI.updateGstRates(rates);
      await fetchConfig();
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to update GST rates";
      setError(message);
      throw err;
    }
  };

  const handleUpdateSkuSettings = async (prefix: string, sequence: number) => {
    try {
      setError(null);
      await ProductConfigAPI.updateSkuSettings(prefix, sequence);
      await fetchConfig();
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to update SKU settings";
      setError(message);
      throw err;
    }
  };

  return {
    config,
    isLoading,
    error,
    refetch: fetchConfig,
    addCategory: handleAddCategory,
    removeCategory: handleRemoveCategory,
    addUnit: handleAddUnit,
    removeUnit: handleRemoveUnit,
    updateGstRates: handleUpdateGstRates,
    updateSkuSettings: handleUpdateSkuSettings,
  };
}
