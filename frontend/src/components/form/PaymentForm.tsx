'use client';

import { useEffect, useState } from 'react';
import InputField from '@/components/form/InputField';
import SelectField from '@/components/form/SelectField';
import TextAreaField from '@/components/form/TextAreaField';
import type { PaymentFormData } from '@/hooks/usePaymentForm';
import type { InvoiceType } from '@/lib/services/invoiceService';
import { getInvoiceBillAmount } from '@/lib/services/invoiceService';

const PAYMENT_MODE_OPTIONS = [
  { value: 'Cash', label: 'Cash' },
  { value: 'Bank Transfer', label: 'Bank Transfer' },
  { value: 'Credit Card', label: 'Credit Card' },
  { value: 'UPI', label: 'UPI' },
  { value: 'Cheque', label: 'Cheque' },
];

interface PaymentFormProps {
  formData: PaymentFormData;
  onFieldChange: (key: keyof PaymentFormData, value: string) => void;
  customerOptions: { value: string; label: string }[];
  invoiceOptions: { value: string; label: string }[];
  invoices: InvoiceType[];
  isLoadingDropdowns: boolean;
  dropdownError: string | null;
  isSubmitting?: boolean;
  submitError?: string | null;
  onSubmit: (e: React.FormEvent<HTMLFormElement>) => void | Promise<void>;
  submitButtonLabel?: string;
  mode?: 'create' | 'edit';
  editData?: Partial<PaymentFormData>;
}

/**
 * Reusable Payment Form Component
 * Used for both Create and Edit functionality
 * Handles:
 * - Dynamic customer and invoice dropdowns
 * - Form validation and error messages
 * - Loading states for dropdown data
 * - Both create and edit modes
 */
export default function PaymentForm({
  formData,
  onFieldChange,
  customerOptions,
  invoiceOptions,
  invoices,
  isLoadingDropdowns,
  dropdownError,
  isSubmitting = false,
  submitError = null,
  onSubmit,
  submitButtonLabel = 'Record Payment',
  mode = 'create',
  editData,
}: PaymentFormProps) {
  const [billAmount, setBillAmount] = useState<number>(0);

  /**
   * When editing, sync editData with formData
   */
  useEffect(() => {
    if (mode === 'edit' && editData) {
      Object.entries(editData).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          onFieldChange(key as keyof PaymentFormData, String(value));
        }
      });
    }
  }, [mode, editData, onFieldChange]);

  /**
   * When invoice changes, fetch and display bill amount
   * Auto-populate payment amount
   */
  useEffect(() => {
    if (formData.invoice && invoices.length > 0) {
      const amount = getInvoiceBillAmount(invoices, formData.invoice);
      setBillAmount(amount);
      
      // Auto-populate amount field
      if (amount && !formData.amount) {
        onFieldChange('amount', String(amount));
      }
    } else {
      setBillAmount(0);
    }
  }, [formData.invoice, invoices, formData.amount, onFieldChange]);

  const isFormDisabled = isLoadingDropdowns || isSubmitting;

  return (
    <form onSubmit={onSubmit} className="space-y-6">
      {/* Dropdown Loading Error */}
      {dropdownError && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
          <p className="font-semibold">Error loading form data</p>
          <p>{dropdownError}</p>
        </div>
      )}

      {/* Submit Error */}
      {submitError && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
          {submitError}
        </div>
      )}

      {/* Loading State */}
      {isLoadingDropdowns && (
        <div className="bg-blue-50 border border-blue-200 text-blue-700 px-4 py-3 rounded-lg text-sm">
          Loading customers and invoices...
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Customer Field */}
        <SelectField
          label="Customer"
          name="customer"
          placeholder="Select Customer"
          options={customerOptions}
          value={formData.customer}
          onChange={(e) => onFieldChange('customer', e.target.value)}
          error={!formData.customer && formData.amount ? 'Customer is required' : ''}
          disabled={isFormDisabled}
        />

        {/* Amount Field */}
        <InputField
          label="Amount"
          name="amount"
          type="number"
          placeholder="0.00"
          value={formData.amount}
          onChange={(e) => onFieldChange('amount', e.target.value)}
          error={!formData.amount && formData.customer ? 'Amount is required' : ''}
          disabled={isFormDisabled}
        />

        {/* Payment Date Field */}
        <InputField
          label="Payment Date"
          name="paymentDate"
          type="date"
          value={formData.paymentDate}
          onChange={(e) => onFieldChange('paymentDate', e.target.value)}
          error={!formData.paymentDate && formData.amount ? 'Payment Date is required' : ''}
          disabled={isFormDisabled}
        />

        {/* Payment Mode Field */}
        <SelectField
          label="Payment Mode"
          name="paymentMode"
          placeholder="Select Payment Mode"
          options={PAYMENT_MODE_OPTIONS}
          value={formData.paymentMode}
          onChange={(e) => onFieldChange('paymentMode', e.target.value)}
          error={!formData.paymentMode && formData.amount ? 'Payment Mode is required' : ''}
          disabled={isFormDisabled}
        />

        {/* Invoice Field */}
        <SelectField
          label="Invoice"
          name="invoice"
          placeholder="Select Invoice"
          options={invoiceOptions}
          value={formData.invoice}
          onChange={(e) => onFieldChange('invoice', e.target.value)}
          error={!formData.invoice && formData.amount ? 'Invoice is required' : ''}
          disabled={isFormDisabled}
        />

        {/* Bill Amount Display Field (Read-only) */}
        <InputField
          label="Bill Amount"
          name="billAmount"
          type="text"
          placeholder="0.00"
          value={billAmount ? `₹${billAmount.toLocaleString('en-IN')}` : '₹0.00'}
          readOnly={true}
          disabled={true}
        />

        {/* Reference Field */}
        <InputField
          label="Reference Number"
          name="reference"
          type="text"
          placeholder="Enter reference"
          value={formData.reference}
          onChange={(e) => onFieldChange('reference', e.target.value)}
          disabled={isFormDisabled}
        />
      </div>

      {/* Notes Field */}
      <TextAreaField
        label="Notes"
        name="notes"
        placeholder="Add any notes about this payment"
        value={formData.notes}
        onChange={(e) => onFieldChange('notes', e.target.value)}
        disabled={isFormDisabled}
      />

      {/* Submit Button */}
      <div className="flex gap-3 justify-end pt-4">
        <button
          type="submit"
          disabled={isFormDisabled}
          className={`px-6 py-2.5 rounded-lg font-medium transition ${
            isFormDisabled
              ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
              : 'bg-emerald-500 text-white hover:bg-emerald-600'
          }`}
        >
          {isSubmitting ? 'Saving...' : submitButtonLabel}
        </button>
      </div>
    </form>
  );
}
