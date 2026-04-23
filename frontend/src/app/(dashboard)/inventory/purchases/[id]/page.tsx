"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { ArrowLeft, Loader2, Edit2, Trash2 } from "lucide-react";
import Link from "next/link";
import VendorPreviewCard from "@/components/purchase/VendorPreviewCard";
import { usePurchases } from "@/hooks/use-purchases";
import { formatCurrency } from "@/data/purchase-form.config";

export default function PurchaseViewPage() {
  const router = useRouter();
  const params = useParams();
  const purchaseId = params.id as string;

  const { fetchPurchaseById, deletePurchase } = usePurchases();
  const [purchase, setPurchase] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    const loadPurchase = async () => {
      try {
        const data = await fetchPurchaseById(purchaseId);
        if (data) {
          setPurchase(data);
        } else {
          setError("Purchase not found");
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load purchase");
      } finally {
        setLoading(false);
      }
    };

    loadPurchase();
  }, [purchaseId]);

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this purchase?")) {
      return;
    }

    try {
      setDeleting(true);
      await deletePurchase(purchaseId);
      router.push("/inventory/purchases");
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to delete purchase");
    } finally {
      setDeleting(false);
    }
  };

  const getTaxTypeLabel = (taxType: string): string => {
    const typeMap: Record<string, string> = {
      intra: "Intra-State (CGST + SGST)",
      inter: "Inter-State (IGST)",
      zero: "Zero-Rated",
      none: "No GST",
    };
    return typeMap[taxType] || taxType;
  };

  if (loading) {
    return (
      <div className="p-6 w-full text-center">
        <Loader2 size={40} className="animate-spin mx-auto text-blue-600" />
        <p className="text-gray-600 mt-2">Loading purchase...</p>
      </div>
    );
  }

  if (error || !purchase) {
    return (
      <div className="p-6 w-full">
        <Link
          href="/inventory/purchases"
          className="flex items-center gap-2 text-blue-600 hover:text-blue-700 mb-4"
        >
          <ArrowLeft size={20} />
          Back to Purchases
        </Link>

        <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
          <p className="text-red-800 text-lg">{error || "Purchase not found"}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 w-full space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <Link
            href="/inventory/purchases"
            className="flex items-center gap-2 text-blue-600 hover:text-blue-700 mb-2"
          >
            <ArrowLeft size={20} />
            Back to Purchases
          </Link>
          <h1 className="text-3xl font-bold">
            Purchase {purchase.purchaseNumber}
          </h1>
          <p className="text-gray-600 mt-1">
            Status: <span className="font-medium capitalize">{purchase.status}</span>
          </p>
        </div>

        <div className="flex gap-2">
          <Link
            href={`/inventory/purchases/${purchaseId}/edit`}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg flex items-center gap-2"
          >
            <Edit2 size={18} />
            Edit
          </Link>
          <button
            onClick={handleDelete}
            disabled={deleting}
            className="px-4 py-2 bg-red-600 hover:bg-red-700 disabled:bg-gray-400 text-white rounded-lg flex items-center gap-2 transition"
          >
            <Trash2 size={18} />
            {deleting ? "Deleting..." : "Delete"}
          </button>
        </div>
      </div>

      {/* Vendor Info */}
      <VendorPreviewCard vendor={purchase.supplierSnapshot} />

      {/* Purchase Details */}
      <div className="bg-white rounded-lg border border-gray-200 p-6 space-y-4">
        <h2 className="text-lg font-semibold text-gray-900">Purchase Details</h2>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          <div>
            <p className="text-sm text-gray-500 mb-1">Purchase Number</p>
            <p className="font-medium">{purchase.purchaseNumber}</p>
          </div>

          <div>
            <p className="text-sm text-gray-500 mb-1">Date</p>
            <p className="font-medium">
              {new Date(purchase.createdAt).toLocaleDateString("en-IN")}
            </p>
          </div>

          <div>
            <p className="text-sm text-gray-500 mb-1">Tax Type</p>
            <p className="font-medium">{getTaxTypeLabel(purchase.taxType)}</p>
          </div>

          <div>
            <p className="text-sm text-gray-500 mb-1">Status</p>
            <p className="font-medium capitalize">{purchase.status}</p>
          </div>
        </div>
      </div>

      {/* Line Items */}
      <div className="bg-white rounded-lg border border-gray-200 p-6 space-y-4">
        <h2 className="text-lg font-semibold text-gray-900">Items</h2>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-4 py-2 text-left text-gray-600 font-semibold">
                  Product
                </th>
                <th className="px-4 py-2 text-right text-gray-600 font-semibold">
                  Qty
                </th>
                <th className="px-4 py-2 text-right text-gray-600 font-semibold">
                  Price
                </th>
                <th className="px-4 py-2 text-right text-gray-600 font-semibold">
                  Taxable
                </th>
                <th className="px-4 py-2 text-right text-gray-600 font-semibold">
                  CGST
                </th>
                <th className="px-4 py-2 text-right text-gray-600 font-semibold">
                  SGST
                </th>
                <th className="px-4 py-2 text-right text-gray-600 font-semibold">
                  IGST
                </th>
                <th className="px-4 py-2 text-right text-gray-600 font-semibold">
                  Total
                </th>
              </tr>
            </thead>
            <tbody>
              {purchase.items?.map((item: any, idx: number) => (
                <tr key={idx} className="border-b border-gray-200 hover:bg-gray-50">
                  <td className="px-4 py-2">{item.productName}</td>
                  <td className="px-4 py-2 text-right">{item.quantity}</td>
                  <td className="px-4 py-2 text-right">
                    {formatCurrency(item.purchasePrice)}
                  </td>
                  <td className="px-4 py-2 text-right">
                    {formatCurrency(item.taxableAmount)}
                  </td>
                  <td className="px-4 py-2 text-right">
                    {formatCurrency(item.cgst)}
                  </td>
                  <td className="px-4 py-2 text-right">
                    {formatCurrency(item.sgst)}
                  </td>
                  <td className="px-4 py-2 text-right">
                    {formatCurrency(item.igst)}
                  </td>
                  <td className="px-4 py-2 text-right font-medium">
                    {formatCurrency(item.totalAmount)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Summary */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Summary</h2>

        <div className="space-y-2 text-right max-w-xs ml-auto">
          <div className="flex justify-between text-gray-600">
            <span>Subtotal:</span>
            <span>{formatCurrency(purchase.subtotal)}</span>
          </div>

          {purchase.taxType === "intra" && (
            <>
              <div className="flex justify-between text-gray-600">
                <span>Total CGST (50%):</span>
                <span>{formatCurrency(purchase.totalCGST)}</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Total SGST (50%):</span>
                <span>{formatCurrency(purchase.totalSGST)}</span>
              </div>
            </>
          )}

          {purchase.taxType === "inter" && (
            <div className="flex justify-between text-gray-600">
              <span>Total IGST:</span>
              <span>{formatCurrency(purchase.totalIGST)}</span>
            </div>
          )}

          {(purchase.taxType === "intra" || purchase.taxType === "inter") && (
            <div className="flex justify-between text-gray-600">
              <span>Total GST:</span>
              <span>{formatCurrency(purchase.totalGST)}</span>
            </div>
          )}

          <div className="flex justify-between text-lg font-bold text-gray-900 pt-2 border-t border-gray-200">
            <span>Grand Total:</span>
            <span>{formatCurrency(purchase.grandTotal)}</span>
          </div>
        </div>
      </div>

      {/* Notes */}
      {purchase.notes && (
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-2">Notes</h2>
          <p className="text-gray-600 whitespace-pre-wrap">{purchase.notes}</p>
        </div>
      )}
    </div>
  );
}
