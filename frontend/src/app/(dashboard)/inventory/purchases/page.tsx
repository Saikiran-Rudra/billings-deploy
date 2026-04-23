"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Eye, Edit2, Trash2, Plus } from "lucide-react";
import Link from "next/link";
import DataTable, { Column, TableAction } from "@/components/table/DataTable";
import { usePurchases } from "@/hooks/use-purchases";
import { purchaseTableColumns, formatCurrency } from "@/data/purchase-form.config";

export default function PurchasesPage() {
  const router = useRouter();
  const {
    purchases,
    loading,
    error,
    pagination,
    fetchPurchases,
    deletePurchase,
  } = usePurchases();

  const [page, setPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [status, setStatus] = useState<string | undefined>(undefined);
  const [deleting, setDeleting] = useState(false);

  const limit = 20;

  // Fetch purchases on mount and when filters change
  useEffect(() => {
    fetchPurchases(page, limit, searchTerm || undefined, status);
  }, [page, searchTerm, status]);

  const handleDelete = async (purchase: any) => {
    if (
      !confirm(
        `Are you sure you want to delete purchase "${purchase.purchaseNumber}"?`
      )
    ) {
      return;
    }

    try {
      setDeleting(true);
      await deletePurchase(purchase._id || purchase.id);
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to delete purchase");
    } finally {
      setDeleting(false);
    }
  };

  const handleEdit = (purchase: any) => {
    router.push(`/inventory/purchases/${purchase._id || purchase.id}/edit`);
  };

  const handleView = (purchase: any) => {
    router.push(`/inventory/purchases/${purchase._id || purchase.id}`);
  };

  const columns: Column[] = [
    { key: "purchaseNumber", header: "Purchase #" },
    {
      key: "supplierSnapshot.supplierName",
      header: "Vendor",
      accessor: (row: any) => row.supplierSnapshot?.supplierName || "-",
    },
    {
      key: "items",
      header: "Items",
      accessor: (row: any) => `${row.items?.length || 0} items`,
    },
    {
      key: "subtotal",
      header: "Subtotal",
      accessor: (row: any) => formatCurrency(row.subtotal || 0),
    },
    {
      key: "totalGST",
      header: "GST",
      accessor: (row: any) => formatCurrency(row.totalGST || 0),
    },
    {
      key: "grandTotal",
      header: "Total",
      accessor: (row: any) => formatCurrency(row.grandTotal || 0),
    },
    {
      key: "taxType",
      header: "Tax Type",
      accessor: (row: any) => {
        const typeMap: Record<string, string> = {
          intra: "Intra-State",
          inter: "Inter-State",
          zero: "Zero-Rated",
          none: "No GST",
        };
        return typeMap[row.taxType] || row.taxType;
      },
    },
    { key: "status", header: "Status" },
    {
      key: "createdAt",
      header: "Date",
      accessor: (row: any) =>
        new Date(row.createdAt).toLocaleDateString("en-IN"),
    },
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
      icon: Trash2,
      variant: "danger",
    },
  ];

  return (
    <div className="p-6 w-full space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Purchases</h1>
        <Link
          href="/inventory/purchases/new"
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2"
        >
          <Plus size={20} />
          New Purchase
        </Link>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800">{error}</p>
        </div>
      )}

      {/* Filters */}
      <div className="flex gap-4 flex-wrap">
        <input
          type="text"
          placeholder="Search by purchase # or vendor..."
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value);
            setPage(1);
          }}
          className="px-4 py-2 border border-gray-300 rounded-lg flex-1 min-w-[200px]"
        />

        <select
          value={status || ""}
          onChange={(e) => {
            setStatus(e.target.value || undefined);
            setPage(1);
          }}
          className="px-4 py-2 border border-gray-300 rounded-lg"
        >
          <option value="">All Statuses</option>
          <option value="draft">Draft</option>
          <option value="confirmed">Confirmed</option>
          <option value="cancelled">Cancelled</option>
        </select>
      </div>

      {/* Table */}
      {loading ? (
        <div className="bg-white rounded-lg border border-gray-200 p-8 text-center">
          <p className="text-gray-500">Loading purchases...</p>
        </div>
      ) : purchases.length === 0 ? (
        <div className="bg-white rounded-lg border border-gray-200 p-8 text-center">
          <p className="text-gray-500">No purchases found</p>
          <Link
            href="/inventory/purchases/new"
            className="text-blue-600 hover:text-blue-700 mt-2 inline-block"
          >
            Create your first purchase
          </Link>
        </div>
      ) : (
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <DataTable
            columns={columns}
            data={purchases as unknown as Record<string, unknown>[]}
            actions={actions}
          />

          {/* Pagination */}
          {pagination && (
            <div className="flex items-center justify-between px-6 py-4 border-t border-gray-200">
              <p className="text-sm text-gray-600">
                Showing {(page - 1) * limit + 1} to{" "}
                {Math.min(page * limit, pagination.total)} of{" "}
                {pagination.total} purchases
              </p>

              <div className="flex gap-2">
                <button
                  onClick={() => setPage(Math.max(1, page - 1))}
                  disabled={page === 1}
                  className="px-3 py-1 border border-gray-300 rounded-lg disabled:opacity-50 hover:bg-gray-50"
                >
                  Previous
                </button>

                <span className="px-3 py-1 flex items-center">
                  Page {page} of {pagination.pages}
                </span>

                <button
                  onClick={() => setPage(Math.min(pagination.pages, page + 1))}
                  disabled={page === pagination.pages}
                  className="px-3 py-1 border border-gray-300 rounded-lg disabled:opacity-50 hover:bg-gray-50"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
