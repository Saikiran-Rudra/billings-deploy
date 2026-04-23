"use client";

import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { Eye, Edit2, Trash2 } from "lucide-react";
import DataTable from "@/components/table/DataTable";
import type { Column, TableAction } from "@/components/table/DataTable";
import { api } from "@/lib/api-client";

interface CustomerRow {
  _id: string;
  displayName: string;
  customerType: string;
  primaryPhone: string;
  gstNumber: string;
  openingBalance: number;
  customerStatus: string;
}

const CUSTOMER_STATUS_OPTIONS = [
  { label: "Active", value: "active" },
  { label: "Inactive", value: "inactive" },
  { label: "Suspended", value: "suspended" },
];

const CUSTOMER_TYPE_OPTIONS = [
  { label: "Retail", value: "retail" },
  { label: "Wholesale", value: "wholesale" },
  { label: "Distributor", value: "distributor" },
];

const columns: Column[] = [
  { key: "displayName", header: "Name" },
  { key: "customerType", header: "Customer Type" },
  { key: "primaryPhone", header: "Phone" },
  { key: "gstNumber", header: "GST" },
  { key: "openingBalance", header: "Outstanding" },
  { key: "customerStatus", header: "Status" },
];

export default function CustomersPage() {
  const router = useRouter();
  const [customers, setCustomers] = useState<CustomerRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isMounted, setIsMounted] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [filterType, setFilterType] = useState("");
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const limit = 20;

  const fetchCustomers = async () => {
    try {
      setLoading(true);
      setError("");

      const query = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
        ...(searchTerm && { search: searchTerm }),
        ...(filterStatus && { status: filterStatus }),
        ...(filterType && { type: filterType }),
      });

      const response = await api.get<any>(`/customers?${query.toString()}`);
      setCustomers(response.data || response.customers || []);
      setTotal(response.pagination?.total || response.data?.length || 0);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to load customers");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    fetchCustomers();
  }, [page, searchTerm, filterStatus, filterType]);

  const handleDelete = async (row: Record<string, unknown>) => {
    if (!confirm("Are you sure you want to delete this customer?")) return;
    try {
      await api.delete(`/customers/${row._id}`);
      setCustomers((prev) => prev.filter((c) => c._id !== row._id));
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : "Failed to delete customer");
    }
  };

  const actions: TableAction[] = [
    { label: "View", onClick: (row) => router.push(`/sales/customers/${row._id}`), icon: Eye },
    { label: "Edit", onClick: (row) => router.push(`/sales/customers/${row._id}/edit`), icon: Edit2 },
    { label: "Delete", onClick: handleDelete, variant: "danger", icon: Trash2 },
  ];
  console.log('customers',customers)

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold">Customers</h2>
        <button onClick={() => router.push("customers/new")} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition">
          + Add Customer
        </button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm mb-4">{error}</div>
      )}

      {/* Filter Section */}
      <div className="bg-white shadow-md rounded-lg p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Search</label>
            <input
              type="text"
              placeholder="Name, Phone, or GST..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Types</option>
              {CUSTOMER_TYPE_OPTIONS.map((type) => (
                <option key={type.value} value={type.value}>
                  {type.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Status</option>
              {CUSTOMER_STATUS_OPTIONS.map((status) => (
                <option key={status.value} value={status.value}>
                  {status.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="bg-white rounded-lg shadow-md p-8">
          <div className="divide-y">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex items-center space-x-4 py-4 px-4">
                <div className="h-4 bg-gray-200 rounded flex-1"></div>
                <div className="h-4 bg-gray-200 rounded flex-1"></div>
                <div className="h-4 bg-gray-200 rounded flex-1"></div>
              </div>
            ))}
          </div>
        </div>
      ) : customers === undefined || customers.length === 0 ? (
        <div className="bg-white rounded-lg shadow-md p-8 text-center text-gray-400">
          No customers yet. Add your first customer!
        </div>
      ) : (
        <>
          {isMounted && 
            <DataTable columns={columns} data={customers as unknown as Record<string, unknown>[]} actions={actions} />
          }
          <div className="flex justify-between items-center bg-white rounded-lg shadow-md p-4 mt-4">
            <div className="text-sm text-gray-600">
              Showing {(page - 1) * limit + 1} to {Math.min(page * limit, total)} of {total} customers
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
    </div>
  );
}
