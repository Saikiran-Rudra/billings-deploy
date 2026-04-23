"use client";

import { useEffect, useState } from "react";
import { TrendingUp, Package, AlertTriangle, DollarSign } from "lucide-react";
import { StockAPI } from "@/lib/services/stockService";

interface StockReport {
  totalProducts?: number;
  totalStock?: number;
  totalValue?: number;
  lowStockProducts?: number;
  avgStock?: number;
}

interface CategorySummary {
  _id: string;
  totalProducts: number;
  totalStock: number;
  totalValue: number;
  avgStock: number;
}

export function StockSummaryDashboard() {
  const [report, setReport] = useState<StockReport | null>(null);
  const [categorySummary, setCategorySummary] = useState<CategorySummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        // Fetch both report and category summary in parallel
        const [reportResult, categoryResult] = await Promise.all([
          StockAPI.generateStockReport().catch(err => {
            console.warn("Stock report failed:", err);
            return null;
          }),
          StockAPI.getStockSummaryByCategory().catch(err => {
            console.warn("Category summary failed:", err);
            return null;
          }),
        ]);

        if (reportResult) {
          const reportData = reportResult.data || reportResult;
          setReport(reportData.data || reportData.report || reportData);
        }

        if (categoryResult) {
          const categoryData = categoryResult.data || categoryResult;
          setCategorySummary(categoryData.data || categoryData.summary || []);
        }

        setError("");
      } catch (err) {
        setError("Failed to load stock summary");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 animate-pulse">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-24 bg-gray-200 rounded-lg" />
        ))}
      </div>
    );
  }

  if (error) {
    return <div className="text-red-600 text-sm">{error}</div>;
  }

  const metrics = [
    {
      label: "Total Products",
      value: report?.totalProducts || 0,
      icon: Package,
      color: "bg-blue-50 text-blue-600",
    },
    {
      label: "Total Stock Units",
      value: (report?.totalStock || 0).toLocaleString(),
      icon: TrendingUp,
      color: "bg-green-50 text-green-600",
    },
    {
      label: "Low Stock Items",
      value: report?.lowStockProducts || 0,
      icon: AlertTriangle,
      color: "bg-yellow-50 text-yellow-600",
    },
    {
      label: "Total Inventory Value",
      value: `₹${(report?.totalValue || 0).toFixed(0)}`,
      icon: DollarSign,
      color: "bg-purple-50 text-purple-600",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {metrics.map((metric, index) => (
          <div key={index} className={`${metric.color} rounded-lg p-6 shadow-sm border`}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">{metric.label}</p>
                <p className="text-2xl font-bold mt-2 text-gray-900">{metric.value}</p>
              </div>
              <metric.icon size={32} className="opacity-20" />
            </div>
          </div>
        ))}
      </div>

      {/* Category Breakdown */}
      {categorySummary.length > 0 && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Stock by Category</h3>
          <div className="space-y-3 max-h-64 overflow-y-auto">
            {categorySummary.map((category) => (
              <div key={category._id} className="flex items-center justify-between py-2">
                <div className="flex-1">
                  <p className="font-medium text-gray-900">{category._id || "Uncategorized"}</p>
                  <div className="text-sm text-gray-600 mt-1">
                    <span>{category.totalProducts} products</span>
                    <span className="mx-2">•</span>
                    <span>{category.totalStock} units</span>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-gray-900">
                    ₹{category.totalValue.toLocaleString()}
                  </p>
                  <p className="text-xs text-gray-500">
                    Avg: {category.avgStock.toFixed(0)} units
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default StockSummaryDashboard;
