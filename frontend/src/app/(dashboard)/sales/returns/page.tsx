"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Eye, Edit2, Trash2 } from "lucide-react";
import DataTable from "@/components/table/DataTable";
import type { Column, TableAction } from "@/components/table/DataTable";
import InputField from "@/components/form/InputField";
import SelectField from "@/components/form/SelectField";
import TextAreaField from "@/components/form/TextAreaField";
import { api } from "@/lib/api-client";

interface SalesReturnRecord {
  _id: string;
  returnId: string;
  date: string;
  originalInvoice: string;
  customer: string;
  items: string;
  amount: number;
  status: "pending" | "approved" | "rejected" | "completed";
  notes: string;
}

interface SalesReturnTableRow {
  _id: string;
  ReturnID: string;
  date: string;
  originalinvoice: string;
  customer: string;
  iteams: string;
  Amount: number;
  status: string;
}

interface EditFormState {
  returnId: string;
  date: string;
  originalInvoice: string;
  customer: string;
  items: string;
  amount: string;
  status: "pending" | "approved" | "rejected" | "completed";
  notes: string;
}

const columns: Column[] = [
  { key: "ReturnID", header: "Return ID" },
  { key: "date", header: "Date" },
  { key: "originalinvoice", header: "Original Invoice" },
  { key: "customer", header: "Customer" },
  { key: "iteams", header: "Items" },
  { key: "Amount", header: "Amount" },
  { key: "status", header: "Status" },
];

const statusOptions = [
  { value: "pending", label: "Pending" },
  { value: "approved", label: "Approved" },
  { value: "rejected", label: "Rejected" },
  { value: "completed", label: "Completed" },
];

const toEditForm = (record: SalesReturnRecord): EditFormState => ({
  returnId: record.returnId,
  date: record.date,
  originalInvoice: record.originalInvoice,
  customer: record.customer,
  items: record.items,
  amount: String(record.amount),
  status: record.status,
  notes: record.notes || "",
});

export default function ReturnsPage() {
  const router = useRouter();
  const [salesReturns, setSalesReturns] = useState<SalesReturnRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const limit = 20;

  const [viewingReturn, setViewingReturn] = useState<SalesReturnRecord | null>(null);
  const [editingReturnId, setEditingReturnId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<EditFormState | null>(null);
  const [editError, setEditError] = useState("");

  // Map backend data to table row format (matching frontend column keys)
  const tableData: SalesReturnTableRow[] = useMemo(
    () =>
      (salesReturns || []).map((sr) => ({
        _id: sr._id,
        ReturnID: sr.returnId,
        date: sr.date,
        originalinvoice: sr.originalInvoice,
        customer: sr.customer,
        iteams: sr.items,
        Amount: sr.amount,
        status: sr.status,
      })),
    [salesReturns]
  );

  // Fetch sales returns from API
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError("");
        
        const query = new URLSearchParams({
          page: page.toString(),
          limit: limit.toString(),
          ...(searchTerm && { search: searchTerm }),
          ...(filterStatus && { status: filterStatus }),
        });
        
        const res = await api.get<any>(`/sales-returns?${query.toString()}`);
        setSalesReturns(res.salesReturns || res.data || []);
        setTotal(res.pagination?.total || 0);
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : "Failed to load sales returns");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [page, searchTerm, filterStatus]);

  // ────── View ──────
  const openView = (row: Record<string, unknown>) => {
    const id = String(row._id || "");
    const record = salesReturns.find((sr) => sr._id === id) || null;
    setViewingReturn(record);
  };

  // ────── Edit ──────
  const openEdit = (row: Record<string, unknown>) => {
    const id = String(row._id || "");
    const record = salesReturns.find((sr) => sr._id === id);
    if (!record) return;

    setEditingReturnId(id);
    setEditForm(toEditForm(record));
    setEditError("");
  };

  const closeEditModal = () => {
    setEditingReturnId(null);
    setEditForm(null);
    setEditError("");
  };

  const updateEditField = (key: keyof EditFormState, value: string) => {
    if (!editForm) return;
    setEditForm({ ...editForm, [key]: value } as EditFormState);
  };

  const handleSaveEdit = async () => {
    if (!editingReturnId || !editForm) return;

    if (!editForm.returnId || !editForm.date || !editForm.customer || !editForm.originalInvoice || !editForm.items) {
      setEditError("Return ID, date, customer, original invoice and items are required");
      return;
    }

    if (!Number.isFinite(Number(editForm.amount)) || Number(editForm.amount) < 0) {
      setEditError("Amount must be a valid non-negative number");
      return;
    }

    try {
      const payload = {
        returnId: editForm.returnId,
        date: editForm.date,
        originalInvoice: editForm.originalInvoice,
        customer: editForm.customer,
        items: editForm.items,
        amount: Number(editForm.amount),
        status: editForm.status,
        notes: editForm.notes,
      };

      const res = await api.put<{ salesReturn: SalesReturnRecord }>(`/sales-returns/${editingReturnId}`, payload);
      setSalesReturns((prev) => prev.map((sr) => (sr._id === editingReturnId ? res.salesReturn : sr)));
      closeEditModal();
    } catch (err: unknown) {
      setEditError(err instanceof Error ? err.message : "Failed to update sales return");
    }
  };

  // ────── Delete ──────
  const handleDelete = async (row: Record<string, unknown>) => {
    const id = String(row._id || "");
    if (!id) return;
    if (!confirm("Are you sure you want to delete this sales return?")) return;

    try {
      await api.delete(`/sales-returns/${id}`);
      setSalesReturns((prev) => prev.filter((sr) => sr._id !== id));
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : "Failed to delete sales return");
    }
  };

  const actions: TableAction[] = [
    { label: "View", onClick: openView, icon: Eye },
    { label: "Edit", onClick: openEdit, icon: Edit2 },
    { label: "Delete", onClick: handleDelete, variant: "danger", icon: Trash2 },
  ];

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold">Sales Returns</h2>
        <button onClick={() => router.push("returns/new")} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition">+ New Return</button>
      </div>

      {error && <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm mb-4">{error}</div>}

      {/* Filter Section */}
      <div className="bg-white shadow-md rounded-lg p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Search</label>
            <input
              type="text"
              placeholder="Return ID, Customer, or Invoice..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Status</option>
              {statusOptions.map((status) => (
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
      ) : tableData.length === 0 ? (
        <div className="bg-white rounded-lg shadow-md p-8 text-center text-gray-400">No sales returns yet. Create your first return.</div>
      ) : (
        <>
          <DataTable columns={columns} data={tableData as unknown as Record<string, unknown>[]} actions={actions} />
          <div className="flex justify-between items-center bg-white rounded-lg shadow-md p-4 mt-4">
            <div className="text-sm text-gray-600">
              Showing {(page - 1) * limit + 1} to {Math.min(page * limit, total)} of {total} sales returns
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

      {/* ───── View Modal ───── */}
      {viewingReturn && (
        <div className="fixed inset-0 bg-black/30 z-40 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-lg w-full max-w-2xl p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-xl font-semibold">Sales Return {viewingReturn.returnId}</h3>
              <button className="text-gray-500 hover:text-gray-700" onClick={() => setViewingReturn(null)}>Close</button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <p><span className="font-semibold">Return ID:</span> {viewingReturn.returnId}</p>
              <p><span className="font-semibold">Date:</span> {viewingReturn.date}</p>
              <p><span className="font-semibold">Customer:</span> {viewingReturn.customer}</p>
              <p><span className="font-semibold">Original Invoice:</span> {viewingReturn.originalInvoice}</p>
              <p><span className="font-semibold">Items:</span> {viewingReturn.items}</p>
              <p><span className="font-semibold">Amount:</span> {viewingReturn.amount.toFixed(2)}</p>
              <p><span className="font-semibold">Status:</span> {viewingReturn.status}</p>
            </div>

            {viewingReturn.notes && <p className="mt-4 text-sm"><span className="font-semibold">Notes:</span> {viewingReturn.notes}</p>}
          </div>
        </div>
      )}

      {/* ───── Edit Modal ───── */}
      {editingReturnId && editForm && (
        <div className="fixed inset-0 bg-black/30 z-40 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-lg w-full max-w-3xl p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-xl font-semibold">Edit Sales Return</h3>
              <button className="text-gray-500 hover:text-gray-700" onClick={closeEditModal}>Close</button>
            </div>

            {editError && <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm mb-4">{editError}</div>}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-5">
              <InputField label="Return ID" name="returnId" value={editForm.returnId} onChange={(e) => updateEditField("returnId", e.target.value)} />
              <InputField label="Date" name="date" type="date" value={editForm.date} onChange={(e) => updateEditField("date", e.target.value)} />
              <InputField label="Customer" name="customer" value={editForm.customer} onChange={(e) => updateEditField("customer", e.target.value)} />
              <InputField label="Original Invoice" name="originalInvoice" value={editForm.originalInvoice} onChange={(e) => updateEditField("originalInvoice", e.target.value)} />
              <InputField label="Amount" name="amount" type="number" value={editForm.amount} onChange={(e) => updateEditField("amount", e.target.value)} />
              <SelectField label="Status" name="status" options={statusOptions} value={editForm.status} onChange={(e) => updateEditField("status", e.target.value)} />
            </div>

            <TextAreaField label="Items" name="items" rows={3} value={editForm.items} onChange={(e) => updateEditField("items", e.target.value)} />
            <div className="mt-3">
              <TextAreaField label="Notes" name="notes" rows={3} value={editForm.notes} onChange={(e) => updateEditField("notes", e.target.value)} />
            </div>

            <div className="flex justify-end gap-2 mt-5">
              <button type="button" onClick={closeEditModal} className="px-4 py-2 border border-gray-300 rounded hover:bg-gray-50">Cancel</button>
              <button type="button" onClick={handleSaveEdit} className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700">Save Changes</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
