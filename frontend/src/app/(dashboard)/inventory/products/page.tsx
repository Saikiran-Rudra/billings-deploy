"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Eye, Edit2, Trash2 } from "lucide-react";
import Link from "next/link";
import DataTable, { Column, TableAction } from "@/components/table/DataTable";
import { api } from "@/lib/api-client";
import { Product } from "@/types";
import { PRODUCT_CATEGORY_OPTIONS } from "@/enums";

interface ApiResponse {
  products: Product[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

export default function ProductsPage() {
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [searchTerm, setSearchTerm] = useState("");
  const [category, setCategory] = useState("");

  const limit = 20;

  // Fetch products
  useEffect(() => {
    fetchProducts();
  }, [page, searchTerm, category]);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      setError("");

      const query = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
        ...(searchTerm && { search: searchTerm }),
        ...(category && { category }),
      });

      const response = await api.get<ApiResponse>(`/products?${query.toString()}`);
      setProducts(response.products);
      setTotal(response.pagination.total);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load products");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (product: Record<string, unknown>) => {
    if (!confirm(`Are you sure you want to delete "${product.productName}"?`)) {
      return;
    }

    try {
      await api.delete(`/products/${product._id || product.id}`);
      setProducts((prev) => prev.filter((p) => (p._id || p.id) !== (product._id || product.id)));
      setTotal(total - 1);
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to delete product");
    }
  };

  const handleEdit = (product: Record<string, unknown>) => {
    router.push(`/inventory/products/${product._id || product.id}/edit`);
  };

  const handleView = (product: Record<string, unknown>) => {
    router.push(`/inventory/products/${product._id || product.id}`);
  };

  const columns: Column[] = [
    { key: "productName", header: "Product Name" },
    { key: "sku", header: "SKU" },
    { key: "category", header: "Category" },
    { key: "salePrice", header: "Sale Price" },
    { key: "purchasePrice", header: "Purchase Price" },
    { key: "unit", header: "Unit" },
    { key: "status", header: "Status" },
  ];

  const actions: TableAction[] = [
    {
      label: "View",
      onClick: handleView,
      icon: Eye,
    },
    {
      label: "Edit",
      onClick: handleEdit,
      icon: Edit2,
    },
    {
      label: "Delete",
      onClick: handleDelete,
      variant: "danger",
      icon: Trash2,
    },
  ];

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Products</h2>
        <Link
          href="/inventory/products/new"
          className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition"
        >
          Add New Product
        </Link>
      </div>

      {/* Filters and Search */}
      <div className="bg-white rounded-lg shadow-md p-4 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2">Search</label>
            <input
              type="text"
              placeholder="Search by product name or SKU..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setPage(1);
              }}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Category</label>
            <select
              value={category}
              onChange={(e) => {
                setCategory(e.target.value);
                setPage(1);
              }}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
            >
              <option value="">All Categories</option>
              {PRODUCT_CATEGORY_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
          <div className="flex items-end">
            <button
              onClick={() => {
                setSearchTerm("");
                setCategory("");
                setPage(1);
              }}
              className="w-full bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-lg transition"
            >
              Clear Filters
            </button>
          </div>
        </div>
      </div>

      {/* Error Message */}
      {error && <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">{error}</div>}

      {/* Empty State */}
      {!loading && products.length === 0 && (
        <div className="bg-white rounded-lg shadow-md p-8 text-center">
          <p className="text-gray-500 mb-4">No products found</p>
          <Link
            href="products/new"
            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition inline-block"
          >
            Add New Product
          </Link>
        </div>
      )}

      {/* Table */}
      {!loading && products.length > 0 && (
        <>
          <DataTable columns={columns} data={products as unknown as Record<string, unknown>[]} actions={actions} />

          {/* Pagination */}
          <div className="flex justify-between items-center bg-white rounded-lg shadow-md p-4">
            <div className="text-sm text-gray-600">
              Showing {(page - 1) * limit + 1} to {Math.min(page * limit, total)} of {total} products
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setPage(Math.max(1, page - 1))}
                disabled={page === 1}
                className="px-4 py-2 border border-gray-300 rounded-lg text-sm disabled:opacity-50"
              >
                Previous
              </button>
              <span className="px-4 py-2 text-sm border border-gray-300 rounded-lg bg-gray-50">
                Page {page} of {Math.ceil(total / limit)}
              </span>
              <button
                onClick={() => setPage(page + 1)}
                disabled={page >= Math.ceil(total / limit)}
                className="px-4 py-2 border border-gray-300 rounded-lg text-sm disabled:opacity-50"
              >
                Next
              </button>
            </div>
          </div>
        </>
      )}

      {/* Loading Skeleton */}
      {loading && (
        <div className="bg-white rounded-lg shadow-md p-8">
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-12 bg-gray-200 rounded animate-pulse" />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
