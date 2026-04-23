/**
 * Hook to fetch and manage dynamic product options from config API
 */

import { useMemo } from "react";
import { useProductConfig } from "./useProductConfig";

export interface FormOption {
  value: string | number;
  label: string;
}

export function useProductOptions() {
  const { config, isLoading, error } = useProductConfig();

  const categoryOptions = useMemo<FormOption[]>(() => {
    if (!config?.categories) return [];
    return config.categories.map((cat) => ({
      value: cat,
      label: cat,
    }));
  }, [config?.categories]);

  const unitOptions = useMemo<FormOption[]>(() => {
    if (!config?.units) return [];
    return config.units.map((unit) => ({
      value: unit,
      label: unit,
    }));
  }, [config?.units]);

  const gstOptions = useMemo<FormOption[]>(() => {
    if (!config?.gstRates) return [];
    return config.gstRates.map((rate) => ({
      value: rate,
      label: `${rate}%`,
    }));
  }, [config?.gstRates]);

  return {
    categoryOptions,
    unitOptions,
    gstOptions,
    isLoading,
    error,
    config,
  };
}
