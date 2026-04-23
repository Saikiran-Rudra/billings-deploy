/**
 * Product Configuration - Static Defaults
 * These defaults are used if no dynamic config exists in DB
 */

export const DEFAULT_PRODUCT_CONFIG = {
  categories: [
    "Electronics",
    "Clothing",
    "Books",
    "Food & Beverages",
    "Furniture",
    "Accessories",
    "Other",
  ],
  units: [
    "Pcs",
    "Box",
    "Pack",
    "Dozen",
    "Meter",
    "KG",
    "Liter",
    "Carton",
  ],
  gstRates: [0, 5, 12, 18, 28],
  sku: {
    prefix: "SKU",
    sequence: 1000,
  },
  defaultHSN: "999999",
  allowNegativeStock: false,
  lowStockThreshold: 10,
  maxProductName: 100,
  minSalePrice: 0,
  minPurchasePrice: 0,
};

export type ProductConfig = typeof DEFAULT_PRODUCT_CONFIG;
