"use client";

import { useState, useCallback } from "react";
import { getAllProducts } from "@/services/product.api";

interface Product {
  _id: string;
  productName: string;
  sku: string;
  category?: string;
}

export function useProducts() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchProducts = useCallback(
    async (page: number = 1, limit: number = 100) => {
      setLoading(true);
      setError(null);
      try {
        const data = await getAllProducts(page, limit);
        setProducts(data);
      } catch (err) {
        const message = err instanceof Error ? err.message : "Failed to fetch products";
        setError(message);
        console.error("Error fetching products:", err);
      } finally {
        setLoading(false);
      }
    },
    []
  );

  return {
    products,
    loading,
    error,
    fetchProducts,
  };
}
