"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Eye, Edit2, Trash2, Plus } from "lucide-react";
import Link from "next/link";
import DataTable, { Column, TableAction } from "@/components/table/DataTable";
import { useSuppliers } from "@/hooks/use-suppliers";
import { supplierTableColumns, formatPaymentTerms } from "@/data/supplier-form.config";

export default function SuppliersPage() {
  const router = useRouter();
  const { suppliers, loading, error, pagination, fetchSuppliers, deleteSupplier } = useSuppliers();

  const [page, setPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [deleting, setDeleting] = useState(false);

  const limit = 20;

  // Fetch suppliers on mount and when filters change
  useEffect(() => {
    fetchSuppliers(page, limit, searchTerm || undefined);
  }, [page, searchTerm]);

  const handleDelete = async (supplier: any) => {
    if (!confirm(`Are you sure you want to delete "${supplier.supplierName}"?`)) {
      return;
    }

    try {
      setDeleting(true);
      await deleteSupplier(supplier._id || supplier.id);
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to delete supplier");
    } finally {
      setDeleting(false);
    }
  };

  const handleEdit = (supplier: any) => {
    router.push(`/inventory/suppliers/${supplier._id || supplier.id}/edit`);
  };

  const handleView = (supplier: any) => {
    router.push(`/inventory/suppliers/${supplier._id || supplier.id}`);
  };

  const columns: Column[] = [
    { key: "supplierName", header: "Supplier Name" },
    { key: "companyName", header: "Company Name" },
    { key: "email", header: "Email" },
    { key: "phone", header: "Phone" },
    { key: "gstNumber", header: "GST Number" },
    { 
      key: "state", 
      header: "State",
      accessor: (row: any) => row.billingAddress?.state || "-"
    },
    {
      key: "paymentTerms",
      header: "Payment Terms",
      accessor: (row: any) => formatPaymentTerms(row.paymentTerms || "")
    },
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
      icon: Trash2,
      variant: "danger",
    },
  ];

  return (
    <div className="p-6 w-full space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Suppliers</h1>
        <Link
          href="/inventory/suppliers/new"
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2"
        >
          <Plus size={20} />
          New Supplier
        </Link>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4">
          {error}
        </div>
      )}

      {/* Search Bar */}
      <div>
        <input
          type="text"
          placeholder="Search suppliers by name, email, or phone..."
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value);
            setPage(1);
          }}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* Empty State */}
      {!loading && suppliers.length === 0 && (
        <div className="bg-white rounded-lg shadow-md p-8 text-center">
          <p className="text-gray-500 mb-4">No suppliers found</p>
          <Link
            href="/inventory/suppliers/new"
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg inline-block"
          >
            Add New Supplier
          </Link>
        </div>
      )}

      {/* Table */}
      {!loading && suppliers.length > 0 && (
        <>
          <DataTable
            columns={columns}
            data={suppliers}
            actions={actions}
            isLoading={loading || deleting}
          />

          {/* Pagination */}
          <div className="flex justify-between items-center bg-white rounded-lg shadow-md p-4">
            <div className="text-sm text-gray-600">
              Showing {(page - 1) * limit + 1} to {Math.min(page * limit, pagination?.total || 0)} of{" "}
              {pagination?.total || 0} suppliers
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setPage(Math.max(1, page - 1))}
                disabled={page === 1}
                className="px-4 py-2 border border-gray-300 rounded-lg text-sm disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              <span className="px-4 py-2 text-sm border border-gray-300 rounded-lg bg-gray-50">
                Page {page} of {Math.ceil((pagination?.total || 0) / limit)}
              </span>
              <button
                onClick={() => setPage(page + 1)}
                disabled={page >= Math.ceil((pagination?.total || 0) / limit)}
                className="px-4 py-2 border border-gray-300 rounded-lg text-sm disabled:opacity-50 disabled:cursor-not-allowed"
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
