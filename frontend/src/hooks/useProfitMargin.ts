import { useMemo } from "react";

interface ProfitMarginData {
  salePrice: number;
  purchasePrice: number;
  profitMargin: number;
  profitMarginPercentage: number;
  isValid: boolean;
}

export const useProfitMargin = (salePrice: string, purchasePrice: string): ProfitMarginData => {
  return useMemo(() => {
    const saleAmount = parseFloat(salePrice) || 0;
    const purchaseAmount = parseFloat(purchasePrice) || 0;
    const profitMargin = saleAmount - purchaseAmount;
    const profitMarginPercentage = purchaseAmount > 0 ? (profitMargin / purchaseAmount) * 100 : 0;

    return {
      salePrice: saleAmount,
      purchasePrice: purchaseAmount,
      profitMargin,
      profitMarginPercentage,
      isValid: saleAmount >= 0 && purchaseAmount >= 0,
    };
  }, [salePrice, purchasePrice]);
};
