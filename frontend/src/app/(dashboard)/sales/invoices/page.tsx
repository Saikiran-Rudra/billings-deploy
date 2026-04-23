"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Eye, Edit2, Trash2 } from "lucide-react";
import DataTable from "@/components/table/DataTable";
import type { Column, TableAction } from "@/components/table/DataTable";
import { api } from "@/lib/api-client";

const INVOICE_STATUS_OPTIONS = [
  { label: "Draft", value: "draft" },
  { label: "Sent", value: "sent" },
  { label: "Partially Paid", value: "partially_paid" },
  { label: "Paid", value: "paid" },
  { label: "Overdue", value: "overdue" },
];

interface CustomerOption {
  _id: string;
  displayName: string;
}

interface InvoiceLineItem {
  itemName: string;
  description: string;
  quantity: number;
  rate: number;
  amount: number;
}

interface InvoiceRecord {
  _id: string;
  invoiceNumber: string;
  invoiceDate: string;
  dueDate: string;
  customerId?: string;
  customerName: string;
  lineItems: InvoiceLineItem[];
  subtotal: number;
  discountType: "flat" | "percent";
  discountValue: number;
  taxPercent: number;
  taxAmount: number;
  total: number;
  notes: string;
  terms: string;
  status: "draft" | "sent" | "partially_paid" | "paid" | "overdue";
}

interface InvoiceTableRow {
  _id: string;
  invoice: string;
  date: string;
  customer: string;
  amount: number;
  duedate: string;
  status: string;
}



const columns: Column[] = [
  { key: "invoice", header: "Invoice no" },
  { key: "date", header: "Date" },
  { key: "customer", header: "Customer" },
  { key: "amount", header: "Amount" },
  { key: "duedate", header: "Due Date" },
  { key: "status", header: "Status" },
];



export default function InvoicesPage() {
  const router = useRouter();
  const [invoices, setInvoices] = useState<InvoiceRecord[]>([]);
  const [customers, setCustomers] = useState<CustomerOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [filterCustomer, setFilterCustomer] = useState("");
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const limit = 20;

  const [viewingInvoice, setViewingInvoice] = useState<InvoiceRecord | null>(null);

  const tableData: InvoiceTableRow[] = useMemo(
    () =>
      invoices.map((invoice) => ({
        _id: invoice._id,
        invoice: invoice.invoiceNumber,
        date: invoice.invoiceDate,
        customer: invoice.customerName,
        amount: invoice.total,
        duedate: invoice.dueDate,
        status: invoice.status,
      })),
    [invoices]
  );

  const customerOptions = useMemo(
    () => (customers || []).map((customer) => ({ value: customer._id, label: customer.displayName })),
    [customers]
  );

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
          ...(filterCustomer && { customer: filterCustomer }),
        });

        const [invoiceRes, customerRes] = await Promise.all([
          api.get<any>(`/invoices?${query.toString()}`),
          api.get<{ success: boolean; message: string; data: CustomerOption[] }>("/customers"),
        ]);
        
        setInvoices(invoiceRes.invoices || invoiceRes.data || []);
        setTotal(invoiceRes.pagination?.total || 0);
        setCustomers((customerRes as { success: boolean; message: string; data: CustomerOption[] }).data);
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : "Failed to load invoices");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [page, searchTerm, filterStatus, filterCustomer]);

  const openView = (row: Record<string, unknown>) => {
    const id = String(row._id || "");
    const invoice = invoices.find((item) => item._id === id) || null;
    setViewingInvoice(invoice);
  };

  const openEdit = (row: Record<string, unknown>) => {
    const id = String(row._id || "");
    if (!id) return;
    router.push(`/sales/invoices/${id}`);
  };

  const handleDelete = async (row: Record<string, unknown>) => {
    const id = String(row._id || "");
    if (!id) return;
    if (!confirm("Are you sure you want to delete this invoice?")) return;

    try {
      await api.delete(`/invoices/${id}`);
      setInvoices((prev) => prev.filter((invoice) => invoice._id !== id));
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : "Failed to delete invoice");
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
        <h2 className="text-2xl font-bold">Invoices</h2>
        <button onClick={() => router.push("/sales/invoices/new")} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition">+ Add Invoice</button>
      </div>

      {error && <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm mb-4">{error}</div>}

      {/* Filter Section */}
      <div className="bg-white shadow-md rounded-lg p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Search</label>
            <input
              type="text"
              placeholder="Invoice # or Customer..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Customer</label>
            <select
              value={filterCustomer}
              onChange={(e) => setFilterCustomer(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Customers</option>
              {customerOptions.map((customer) => (
                <option key={customer.value} value={customer.label}>
                  {customer.label}
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
              {INVOICE_STATUS_OPTIONS.map((status) => (
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
        <div className="bg-white rounded-lg shadow-md p-8 text-center text-gray-400">No invoices yet. Create your first invoice.</div>
      ) : (
        <>
          <DataTable columns={columns} data={tableData as unknown as Record<string, unknown>[]} actions={actions} />
          <div className="flex justify-between items-center bg-white rounded-lg shadow-md p-4 mt-4">
            <div className="text-sm text-gray-600">
              Showing {(page - 1) * limit + 1} to {Math.min(page * limit, total)} of {total} invoices
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

      {viewingInvoice && (
        <div className="fixed inset-0 bg-black/30 z-40 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-lg w-full max-w-3xl p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-xl font-semibold">Invoice {viewingInvoice.invoiceNumber}</h3>
              <button className="text-gray-500 hover:text-gray-700" onClick={() => setViewingInvoice(null)}>Close</button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm mb-5">
              <p><span className="font-semibold">Customer:</span> {viewingInvoice.customerName}</p>
              <p><span className="font-semibold">Date:</span> {viewingInvoice.invoiceDate}</p>
              <p><span className="font-semibold">Due Date:</span> {viewingInvoice.dueDate}</p>
              <p><span className="font-semibold">Status:</span> {viewingInvoice.status}</p>
            </div>

            <div className="overflow-x-auto border rounded-lg">
              <table className="w-full text-sm">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="px-3 py-2 text-left">Item</th>
                    <th className="px-3 py-2 text-left">Qty</th>
                    <th className="px-3 py-2 text-left">Rate</th>
                    <th className="px-3 py-2 text-left">Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {viewingInvoice.lineItems.map((item, idx) => (
                    <tr key={`${item.itemName}-${idx}`} className="border-t">
                      <td className="px-3 py-2">{item.itemName}</td>
                      <td className="px-3 py-2">{item.quantity}</td>
                      <td className="px-3 py-2">{item.rate.toFixed(2)}</td>
                      <td className="px-3 py-2">{item.amount.toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="mt-5 text-sm grid gap-1">
              <p><span className="font-semibold">Subtotal:</span> {viewingInvoice.subtotal.toFixed(2)}</p>
              <p><span className="font-semibold">Tax:</span> {viewingInvoice.taxAmount.toFixed(2)}</p>
              <p><span className="font-semibold">Total:</span> {viewingInvoice.total.toFixed(2)}</p>
            </div>

            {viewingInvoice.notes && <p className="mt-4 text-sm"><span className="font-semibold">Notes:</span> {viewingInvoice.notes}</p>}
            {viewingInvoice.terms && <p className="mt-2 text-sm"><span className="font-semibold">Terms:</span> {viewingInvoice.terms}</p>}
          </div>
        </div>
      )}
    </div>
  );
}
