"use client";

import { useEffect, useState } from "react";
import { AlertCircle, TrendingDown } from "lucide-react";
import { StockAPI } from "@/lib/services/stockService";

interface LowStockProduct {
  _id: string;
  productName: string;
  sku: string;
  currentStock: number;
  minStock: number;
  category: string;
}

export function LowStockAlerts() {
  const [products, setProducts] = useState<LowStockProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchLowStockProducts = async () => {
      try {
        setLoading(true);
        const result = await StockAPI.getLowStockProducts();
        const data = result.data || result;
        setProducts(data.data || data.products || []);
        setError("");
      } catch (err) {
        setError("Failed to load low stock products");
        setProducts([]);
      } finally {
        setLoading(false);
      }
    };

    fetchLowStockProducts();
  }, []);

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <p className="text-red-700 text-sm">{error}</p>
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="bg-green-50 border border-green-200 rounded-lg p-4">
        <p className="text-green-700 font-semibold">✓ All stock levels healthy</p>
        <p className="text-green-600 text-sm mt-1">No products below minimum threshold</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 mb-4">
        <AlertCircle className="text-yellow-600" size={20} />
        <h3 className="font-semibold text-gray-900">
          {products.length} product{products.length > 1 ? "s" : ""} below minimum stock
        </h3>
      </div>

      <div className="space-y-2">
        {products.slice(0, 5).map((product) => (
          <div
            key={product._id}
            className="block p-3 bg-yellow-50 border border-yellow-200 rounded-lg"
          >
            <div className="flex items-center justify-between">
              <div className="min-w-0">
                <p className="font-semibold text-gray-900 truncate">
                  {product.productName}
                </p>
                <p className="text-xs text-gray-600 mt-1">
                  SKU: {product.sku} | Category: {product.category}
                </p>
              </div>
              <div className="text-right shrink-0 ml-2">
                <div className="text-sm font-semibold text-red-600">
                  {product.currentStock}
                  <span className="text-xs text-gray-600"> / {product.minStock}</span>
                </div>
                <TrendingDown className="text-red-600 mt-1" size={16} />
              </div>
            </div>
          </div>
        ))}
      </div>

      {products.length > 5 && (
        <div className="block text-center text-gray-600 text-sm py-2">
          ... and {products.length - 5} more products below minimum stock
        </div>
      )}
    </div>
  );
}

export default LowStockAlerts;
