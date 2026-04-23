'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  fetchCustomers,
  mapCustomersToOptions,
  type CustomerType,
} from '@/lib/services/customerService';
import {
  fetchInvoices,
  mapInvoicesToOptions,
  type InvoiceType,
} from '@/lib/services/invoiceService';

export interface PaymentFormData {
  customer: string;
  amount: string;
  paymentDate: string;
  paymentMode: string;
  invoice: string;
  reference: string;
  notes: string;
}

interface UsePaymentFormReturn {
  formData: PaymentFormData;
  setFormData: (data: PaymentFormData) => void;
  updateField: (key: keyof PaymentFormData, value: string) => void;
  customers: CustomerType[];
  invoices: InvoiceType[];
  customerOptions: { value: string; label: string }[];
  invoiceOptions: { value: string; label: string }[];
  isLoadingDropdowns: boolean;
  dropdownError: string | null;
  resetForm: () => void;
}

const INITIAL_FORM_DATA: PaymentFormData = {
  customer: '',
  amount: '',
  paymentDate: '',
  paymentMode: '',
  invoice: '',
  reference: '',
  notes: '',
};

/**
 * Custom hook for managing payment form state and dropdown data
 * Handles:
 * - Form data state management
 * - Fetching customers and invoices
 * - Converting fetched data to dropdown options
 * - Loading and error states
 * - Form reset functionality
 */
export function usePaymentForm(
  initialData?: Partial<PaymentFormData>
): UsePaymentFormReturn {
  const [formData, setFormData] = useState<PaymentFormData>({
    ...INITIAL_FORM_DATA,
    ...initialData,
  });

  const [customers, setCustomers] = useState<CustomerType[]>([]);
  const [invoices, setInvoices] = useState<InvoiceType[]>([]);
  const [isLoadingDropdowns, setIsLoadingDropdowns] = useState(true);
  const [dropdownError, setDropdownError] = useState<string | null>(null);

  /**
   * Fetch customers and invoices on component mount
   */
  useEffect(() => {
    const loadDropdownData = async () => {
      setIsLoadingDropdowns(true);
      setDropdownError(null);

      try {
        const [customersData, invoicesData] = await Promise.all([
          fetchCustomers(),
          fetchInvoices(),
        ]);

        setCustomers(customersData);
        setInvoices(invoicesData);
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : 'Failed to load dropdown data';
        setDropdownError(errorMessage);
        console.error('Dropdown data loading error:', error);
      } finally {
        setIsLoadingDropdowns(false);
      }
    };

    loadDropdownData();
  }, []);

  /**
   * Update a single form field
   */
  const updateField = useCallback(
    (key: keyof PaymentFormData, value: string) => {
      setFormData((prev) => ({ ...prev, [key]: value }));
    },
    []
  );

  /**
   * Reset form to initial state
   */
  const resetForm = useCallback(() => {
    setFormData({ ...INITIAL_FORM_DATA, ...initialData });
  }, [initialData]);

  // Convert fetched data to dropdown options
  const customerOptions = mapCustomersToOptions(customers);
  const invoiceOptions = mapInvoicesToOptions(invoices);

  return {
    formData,
    setFormData,
    updateField,
    customers,
    invoices,
    customerOptions,
    invoiceOptions,
    isLoadingDropdowns,
    dropdownError,
    resetForm,
  };
}
