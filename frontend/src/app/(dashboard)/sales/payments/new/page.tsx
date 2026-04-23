'use client';

import { useRouter } from 'next/navigation';
import { FormEvent, useState } from 'react';
import { api } from '@/lib/api-client';
import PaymentForm from '@/components/form/PaymentForm';
import { usePaymentForm, type PaymentFormData } from '@/hooks/usePaymentForm';
import { useAuth } from "@/hooks/use-auth";

export default function NewPaymentPage() {
  const router = useRouter();
  const auth = useAuth();
  const {
    formData,
    updateField,
    customers,
    invoices,
    customerOptions,
    invoiceOptions,
    isLoadingDropdowns,
    dropdownError,
    resetForm,
  } = usePaymentForm();

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [success, setSuccess] = useState('');

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSubmitError(null);
    setSuccess('');

    // Validation
    if (
      !formData.customer ||
      !formData.amount ||
      !formData.paymentDate ||
      !formData.paymentMode ||
      !formData.invoice
    ) {
      setSubmitError('Please fill all required fields.');
      return;
    }

    const amountNumber = Number(formData.amount);
    if (!Number.isFinite(amountNumber) || amountNumber <= 0) {
      setSubmitError('Amount must be greater than 0.');
      return;
    }

    setIsSubmitting(true);

    try {
      await api.post<{ message: string }>('/payments', {
        // Convert to string to ensure it's a valid ObjectId string
        companyId: typeof auth.user?.companyId === 'string' 
          ? auth.user.companyId 
          : (auth.user?.companyId as any)?.toString?.() || String(auth.user?.companyId),
        date: formData.paymentDate,
        invoice: formData.invoice,
        customer: formData.customer,
        Amount: amountNumber,
        paymentmode: formData.paymentMode,
        reference: formData.reference?.trim() || '',
        notes: formData.notes?.trim() || '',
      });

      setSuccess('Payment saved successfully.');
      resetForm();
      setTimeout(() => {
        router.push('/sales/payments');
      }, 500);
    } catch (err: unknown) {
      setSubmitError(err instanceof Error ? err.message : 'Failed to save payment');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Record New Payment</h1>
      </div>

      {success && (
        <div className="mb-4 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg text-sm">
          {success}
        </div>
      )}

      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <PaymentForm
          formData={formData}
          onFieldChange={updateField}
          customerOptions={customerOptions}
          invoiceOptions={invoiceOptions}
          invoices={invoices}
          isLoadingDropdowns={isLoadingDropdowns}
          dropdownError={dropdownError}
          isSubmitting={isSubmitting}
          submitError={submitError}
          onSubmit={handleSubmit}
          submitButtonLabel="Save Payment"
          mode="create"
        />
      </div>
    </div>
  );
}
