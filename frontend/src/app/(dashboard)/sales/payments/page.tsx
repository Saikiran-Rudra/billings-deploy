'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';
import { Edit2, Trash2 } from 'lucide-react';
import DataTable from '@/components/table/DataTable';
import type { Column, TableAction } from '@/components/table/DataTable';
import PaymentForm from '@/components/form/PaymentForm';
import { api } from '@/lib/api-client';
import { usePaymentForm, type PaymentFormData } from '@/hooks/usePaymentForm';

const PAYMENT_MODE_OPTIONS = [
  { label: "Cash", value: "Cash" },
  { label: "Bank Transfer", value: "Bank Transfer" },
  { label: "Credit Card", value: "Credit Card" },
  { label: "UPI", value: "UPI" },
];

type PaymentRecord = {
  _id: string;
  date: string;
  invoice: string;
  customer: string;
  Amount: number;
  paymentmode: 'Cash' | 'Bank Transfer' | 'Credit Card' | 'UPI';
  reference: string;
  notes?: string;
};

const columns: Column[] = [
  { key: 'date', header: 'Date' },
  { key: 'invoice', header: 'Invoice' },
  { key: 'customer', header: 'Customer' },
  { key: 'Amount', header: 'Amount' },
  { key: 'paymentmode', header: 'Payment Mode' },
  { key: 'reference', header: 'Reference' },
];

export default function PaymentsPage() {
  const router = useRouter();
  const [payments, setPayments] = useState<PaymentRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [pageError, setPageError] = useState('');
  const [editingPaymentId, setEditingPaymentId] = useState<string | null>(null);
  const [editError, setEditError] = useState('');
  const [isEditSubmitting, setIsEditSubmitting] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const limit = 20;

  const {
    formData: editFormData,
    updateField: updateEditField,
    invoices,
    customerOptions,
    invoiceOptions,
    isLoadingDropdowns,
    dropdownError,
  } = usePaymentForm();

  const filteredPayments = useMemo(
    () =>
      payments.filter(
        (payment) =>
          payment.customer.toLowerCase().includes(searchTerm.toLowerCase()) ||
          payment.invoice.toLowerCase().includes(searchTerm.toLowerCase()) ||
          payment.reference.toLowerCase().includes(searchTerm.toLowerCase())
      ),
    [payments, searchTerm]
  );

  // Fetch payments list
  useEffect(() => {
    const fetchPayments = async () => {
      try {
        setLoading(true);
        setPageError('');
        
        const query = new URLSearchParams({
          page: page.toString(),
          limit: limit.toString(),
          ...(searchTerm && { search: searchTerm }),
        });
        
        const res = await api.get<any>(`/payments?${query.toString()}`);
        setPayments(res.payments || res.data || []);
        setTotal(res.pagination?.total || 0);
      } catch (err: unknown) {
        setPageError(err instanceof Error ? err.message : 'Failed to load payments');
      } finally {
        setLoading(false);
      }
    };

    fetchPayments();
  }, [page, searchTerm]);

  const handleDelete = async (row: Record<string, unknown>) => {
    const id = String(row._id || '');
    if (!id) return;
    if (!confirm('Are you sure you want to delete this payment?')) return;

    try {
      await api.delete(`/payments/${id}`);
      setPayments((prev) => prev.filter((payment) => payment._id !== id));
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Failed to delete payment');
    }
  };

  const openEditModal = (row: Record<string, unknown>) => {
    const id = String(row._id || '');
    if (!id) return;
    const payment = payments.find((item) => item._id === id);
    if (!payment) return;

    setEditError('');
    setEditingPaymentId(id);

    // Pre-fill form with current payment data
    updateEditField('customer', payment.customer);
    updateEditField('amount', String(payment.Amount));
    updateEditField('paymentDate', payment.date);
    updateEditField('paymentMode', payment.paymentmode);
    updateEditField('invoice', payment.invoice);
    updateEditField('reference', payment.reference);
    updateEditField('notes', payment.notes ?? '');
  };

  const closeEditModal = () => {
    setEditingPaymentId(null);
    setEditError('');
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (editingPaymentId === null) return;

    // Validation
    if (
      !editFormData.customer ||
      !editFormData.amount ||
      !editFormData.paymentDate ||
      !editFormData.paymentMode ||
      !editFormData.invoice
    ) {
      setEditError('Please fill all required fields.');
      return;
    }

    const amountNumber = Number(editFormData.amount);
    if (!Number.isFinite(amountNumber) || amountNumber <= 0) {
      setEditError('Amount must be greater than 0.');
      return;
    }

    setIsEditSubmitting(true);
    setEditError('');

    try {
      const res = await api.put<{ payment: PaymentRecord }>(
        `/payments/${editingPaymentId}`,
        {
          customer: editFormData.customer,
          Amount: amountNumber,
          date: editFormData.paymentDate,
          paymentmode: editFormData.paymentMode,
          invoice: editFormData.invoice,
          reference: editFormData.reference,
          notes: editFormData.notes,
        }
      );

      setPayments((prev) =>
        prev.map((payment) =>
          payment._id === editingPaymentId ? res.payment : payment
        )
      );
      closeEditModal();
    } catch (err: unknown) {
      setEditError(err instanceof Error ? err.message : 'Failed to update payment');
    } finally {
      setIsEditSubmitting(false);
    }
  };

  const actions: TableAction[] = [
    { label: 'Edit', onClick: openEditModal, icon: Edit2 },
    { label: 'Delete', onClick: handleDelete, variant: 'danger', icon: Trash2 },
  ];

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold">Payment Received</h2>
        <button
          onClick={() => router.push('payments/new')}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
        >
          + Record Payment
        </button>
      </div>

      {pageError && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm mb-4">
          {pageError}
        </div>
      )}

      {/* Filter Section */}
      <div className="bg-white shadow-md rounded-lg p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Search</label>
            <input
              type="text"
              placeholder="Customer, Invoice, or Reference..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
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
      ) : payments.length === 0 ? (
        <div className="bg-white rounded-lg shadow-md p-8 text-center text-gray-400">
          No payments yet. Record your first payment.
        </div>
      ) : (
        <>
          <DataTable
            columns={columns}
            data={filteredPayments as unknown as Record<string, unknown>[]}
            actions={actions}
          />
          <div className="flex justify-between items-center bg-white rounded-lg shadow-md p-4 mt-4">
            <div className="text-sm text-gray-600">
              Showing {(page - 1) * limit + 1} to {Math.min(page * limit, total)} of {total} payments
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

      {/* Edit Modal with Dynamic Form */}
      {editingPaymentId !== null && (
        <div className="fixed inset-0 bg-black/30 z-40 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6">
            <h3 className="text-xl font-semibold mb-4">Edit Payment</h3>

            <PaymentForm
              formData={editFormData}
              onFieldChange={updateEditField}
              customerOptions={customerOptions}
              invoiceOptions={invoiceOptions}
              invoices={invoices}
              isLoadingDropdowns={isLoadingDropdowns}
              dropdownError={dropdownError}
              isSubmitting={isEditSubmitting}
              submitError={editError}
              onSubmit={handleEditSubmit}
              submitButtonLabel="Update Payment"
              mode="edit"
            />

            {/* Close Button */}
            <div className="flex justify-start mt-4 pt-4 border-t border-gray-200">
              <button
                type="button"
                onClick={closeEditModal}
                className="px-4 py-2 border border-gray-300 rounded hover:bg-gray-50 transition"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
