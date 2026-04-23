"use client";
import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { api } from "@/lib/api-client";
import { Product } from "@/types";

export default function ProductDetailPage() {
  const router = useRouter();
  const params = useParams();
  const productId = params.id as string;

  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const data = await api.get<Product>(`/products/${productId}`);
        setProduct(data);
        setError("");
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load product");
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [productId]);

  const handleDelete = async () => {
    if (!confirm(`Are you sure you want to delete "${product?.productName}"?`)) {
      return;
    }

    setDeleting(true);
    try {
      await api.delete(`/products/${productId}`);
      router.push("/inventory/products");
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to delete product");
      setDeleting(false);
    }
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="flex justify-center items-center h-64">
          <div className="text-gray-500">Loading product...</div>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="p-6 space-y-4">
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">{error || "Product not found"}</div>
        <Link href="/inventory/products" className="text-blue-600 hover:text-blue-700">
          ← Back to Products
        </Link>
      </div>
    );
  }

  const purchasePrice = product.purchasePrice ?? 0;
  const profit = product.salePrice - purchasePrice;
  const profitPercent = purchasePrice > 0 ? (profit / purchasePrice) * 100 : 0;
  const margin = purchasePrice > 0 ? (profit / product.salePrice) * 100 : 0;

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h2 className="text-3xl font-bold">{product.productName}</h2>
          <p className="text-gray-600 mt-1">SKU: {product.sku}</p>
        </div>
        <div className="flex gap-2">
          <Link
            href={`/inventory/products/${productId}/edit`}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition"
          >
            Edit
          </Link>
          <button
            onClick={handleDelete}
            disabled={deleting}
            className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition disabled:opacity-50"
          >
            {deleting ? "Deleting..." : "Delete"}
          </button>
          <Link href="/inventory/products" className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg transition">
            Back
          </Link>
        </div>
      </div>

      {/* Status Badge */}
      <div>
        <span
          className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${
            product.status === "active" ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"
          }`}
        >
          {product.status === "active" ? "Active" : "Inactive"}
        </span>
      </div>

      {/* Main Info Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Basic Info */}
        <div className="bg-white rounded-lg shadow-md p-6 space-y-4">
          <h3 className="text-lg font-semibold border-b pb-2">Basic Information</h3>
          <div>
            <p className="text-gray-600 text-sm">Category</p>
            <p className="font-medium">{product.category || "N/A"}</p>
          </div>
          <div>
            <p className="text-gray-600 text-sm">Unit</p>
            <p className="font-medium">{product.unit}</p>
          </div>
        </div>

        {/* Pricing Info */}
        <div className="bg-white rounded-lg shadow-md p-6 space-y-4">
          <h3 className="text-lg font-semibold border-b pb-2">Pricing</h3>
          <div>
            <p className="text-gray-600 text-sm">Purchase Price</p>
            <p className="font-medium text-lg">₹ {purchasePrice.toFixed(2)}</p>
          </div>
          <div>
            <p className="text-gray-600 text-sm">Sale Price</p>
            <p className="font-medium text-lg text-green-600">₹ {product.salePrice.toFixed(2)}</p>
          </div>
          <div>
            <p className="text-gray-600 text-sm">GST Rate</p>
            <p className="font-medium">{product.gst ? `${product.gst}%` : "N/A"}</p>
          </div>
        </div>

        {/* Stock Info */}
        <div className="bg-white rounded-lg shadow-md p-6 space-y-4">
          <h3 className="text-lg font-semibold border-b pb-2">Stock Information</h3>
          <div>
            <p className="text-gray-600 text-sm">Current Stock</p>
            <p className="font-medium text-lg">{product.currentStock ?? 0} {product.unit}</p>
          </div>
        </div>
      </div>

      {/* Profit Analysis */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-green-50 border border-green-200 rounded-lg shadow-md p-6 space-y-2">
          <h3 className="text-sm font-medium text-gray-600">Profit Per Unit</h3>
          <p className="text-2xl font-bold text-green-600">₹ {Math.max(profit, 0).toFixed(2)}</p>
        </div>
        <div className="bg-blue-50 border border-blue-200 rounded-lg shadow-md p-6 space-y-2">
          <h3 className="text-sm font-medium text-gray-600">Profit %</h3>
          <p className="text-2xl font-bold text-blue-600">{Math.max(profitPercent, 0).toFixed(2)}%</p>
        </div>
        <div className="bg-purple-50 border border-purple-200 rounded-lg shadow-md p-6 space-y-2">
          <h3 className="text-sm font-medium text-gray-600">Margin %</h3>
          <p className="text-2xl font-bold text-purple-600">{Math.max(margin, 0).toFixed(2)}%</p>
        </div>
      </div>

      {/* Description */}
      {product.description && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold mb-3">Description</h3>
          <p className="text-gray-700 whitespace-pre-wrap">{product.description}</p>
        </div>
      )}

      {/* Timestamps */}
      <div className="bg-gray-50 rounded-lg shadow-md p-6 text-sm text-gray-600 space-y-1">
        <p>Created: {product.createdAt ? new Date(product.createdAt).toLocaleString() : "N/A"}</p>
        <p>Last Updated: {product.updatedAt ? new Date(product.updatedAt).toLocaleString() : "N/A"}</p>
      </div>
    </div>
  );
}
