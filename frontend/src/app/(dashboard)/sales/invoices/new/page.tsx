"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import FormWrapper from "@/components/form/FormWrapper";
import InputField from "@/components/form/InputField";
import SelectField from "@/components/form/SelectField";
import TextAreaField from "@/components/form/TextAreaField";
import { api } from "@/lib/api-client";
import { useAuth } from "@/hooks/use-auth";

interface CustomerOption {
  _id: string;
  displayName: string;
}

interface LineItem {
  itemName: string;
  description: string;
  quantity: string;
  rate: string;
}

const defaultLineItem = (): LineItem => ({
  itemName: "",
  description: "",
  quantity: "1",
  rate: "0",
});

function calculateTotals(lineItems: LineItem[], discountType: "flat" | "percent", discountValue: string, taxPercent: string) {
  const subtotal = lineItems.reduce((sum, item) => {
    const qty = Number(item.quantity || 0);
    const rate = Number(item.rate || 0);
    return sum + qty * rate;
  }, 0);

  const discountNumeric = Number(discountValue || 0);
  const discount = discountType === "percent" ? (subtotal * discountNumeric) / 100 : discountNumeric;
  const taxable = Math.max(0, subtotal - discount);
  const tax = (taxable * Number(taxPercent || 0)) / 100;
  const total = taxable + tax;

  return {
    subtotal: Number(subtotal.toFixed(2)),
    discount: Number(discount.toFixed(2)),
    tax: Number(tax.toFixed(2)),
    total: Number(total.toFixed(2)),
  };
}

export default function NewInvoicePage() {
  const router = useRouter();
  const auth = useAuth();

  const [customers, setCustomers] = useState<CustomerOption[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [formData, setFormData] = useState({
    invoiceNumber: "",
    invoiceDate: "",
    dueDate: "",
    customerId: "",
    customerName: "",
    discountType: "flat" as "flat" | "percent",
    discountValue: "0",
    taxPercent: "0",
    notes: "",
    terms: "",
    status: "draft" as "draft" | "sent" | "partially_paid" | "paid" | "overdue",
  });

  const [lineItems, setLineItems] = useState<LineItem[]>([defaultLineItem()]);

  useEffect(() => {
    const fetchCustomers = async () => {
      try {
        const res = await api.get<{ success: boolean; message: string; data: CustomerOption[] }>("/customers");
        setCustomers((res as { success: boolean; message: string; data: CustomerOption[] }).data);
      } catch {
        // Keep form usable even if customer fetch fails.
      }
    };

    fetchCustomers();
  }, []);

  useEffect(() => {
    if (!formData.invoiceNumber) {
      const today = new Date();
      const generated = `INV-${today.getFullYear()}${String(today.getMonth() + 1).padStart(2, "0")}${String(today.getDate()).padStart(2, "0")}-${Math.floor(Math.random() * 900 + 100)}`;
      setFormData((prev) => ({ ...prev, invoiceNumber: generated }));
    }
  }, [formData.invoiceNumber]);

  const customerOptions = useMemo(
    () => customers.map((customer) => ({ value: customer._id, label: customer.displayName })),
    [customers]
  );

  const totals = useMemo(
    () => calculateTotals(lineItems, formData.discountType, formData.discountValue, formData.taxPercent),
    [lineItems, formData.discountType, formData.discountValue, formData.taxPercent]
  );

  const updateField = (key: keyof typeof formData, value: string) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
  };

  const updateLineItem = (index: number, key: keyof LineItem, value: string) => {
    setLineItems((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], [key]: value };
      return next;
    });
  };

  const addLineItem = () => setLineItems((prev) => [...prev, defaultLineItem()]);

  const removeLineItem = (index: number) => {
    setLineItems((prev) => {
      const next = prev.filter((_, i) => i !== index);
      return next.length ? next : [defaultLineItem()];
    });
  };

  const onSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!formData.invoiceNumber || !formData.invoiceDate || !formData.dueDate) {
      setError("Invoice number, invoice date and due date are required.");
      return;
    }

    if (!formData.customerId && !formData.customerName.trim()) {
      setError("Please select a customer.");
      return;
    }

    const invalidItem = lineItems.some(
      (item) => !item.itemName.trim() || Number(item.quantity) <= 0 || Number(item.rate) < 0
    );
    if (invalidItem) {
      setError("Each line item must have name, valid quantity and rate.");
      return;
    }

    setIsSubmitting(true);

    try {
      await api.post<{ message: string }>("/invoices", {
        // Convert to string to ensure it's a valid ObjectId string
        companyId: typeof auth.user?.companyId === 'string' 
          ? auth.user.companyId 
          : (auth.user?.companyId as any)?.toString?.() || String(auth.user?.companyId),
        invoiceNumber: formData.invoiceNumber,
        invoiceDate: formData.invoiceDate,
        dueDate: formData.dueDate,
        customerId: formData.customerId || undefined,
        customerName: formData.customerName,
        lineItems: lineItems.map((item) => ({
          itemName: item.itemName,
          description: item.description,
          quantity: Number(item.quantity),
          rate: Number(item.rate),
        })),
        discountType: formData.discountType,
        discountValue: Number(formData.discountValue || 0),
        taxPercent: Number(formData.taxPercent || 0),
        notes: formData.notes,
        terms: formData.terms,
        status: formData.status,
      });

      setSuccess("Invoice created successfully.");
      setTimeout(() => router.push("/sales/invoices"), 500);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to create invoice");
      setIsSubmitting(false);
    }
  };

  return (
    <FormWrapper
      title="Create New Invoice"
      onSubmit={onSubmit}
      submitLabel="Save Invoice"
      isLoading={isSubmitting}
      error={error}
      success={success}
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <InputField label="Invoice Number" name="invoiceNumber" value={formData.invoiceNumber} onChange={(e) => updateField("invoiceNumber", e.target.value)} required />
        <InputField label="Invoice Date" name="invoiceDate" type="date" value={formData.invoiceDate} onChange={(e) => updateField("invoiceDate", e.target.value)} required />
        <SelectField label="Customer" name="customerId" placeholder="Select Customer" options={customerOptions} value={formData.customerId} onChange={(e) => {
          const selected = customers.find((c) => c._id === e.target.value);
          setFormData((prev) => ({ ...prev, customerId: e.target.value, customerName: selected?.displayName || "" }));
        }} />
        <InputField label="Due Date" name="dueDate" type="date" value={formData.dueDate} onChange={(e) => updateField("dueDate", e.target.value)} required />
        <SelectField label="Status" name="status" options={[
          { value: "draft", label: "Draft" },
          { value: "sent", label: "Sent" },
          { value: "partially_paid", label: "Partially Paid" },
          { value: "paid", label: "Paid" },
          { value: "overdue", label: "Overdue" },
        ]} value={formData.status} onChange={(e) => updateField("status", e.target.value)} />
      </div>

      <h3 className="text-lg font-semibold">Line Items</h3>
      <div className="space-y-3">
        {lineItems.map((item, index) => (
          <div key={`line-item-${index}`} className="grid grid-cols-1 md:grid-cols-12 gap-2 items-end border border-gray-200 rounded-lg p-3">
            <div className="md:col-span-3">
              <InputField label="Item" name={`item-${index}`} value={item.itemName} onChange={(e) => updateLineItem(index, "itemName", e.target.value)} />
            </div>
            <div className="md:col-span-3">
              <InputField label="Description" name={`description-${index}`} value={item.description} onChange={(e) => updateLineItem(index, "description", e.target.value)} />
            </div>
            <div className="md:col-span-2">
              <InputField label="Quantity" name={`qty-${index}`} type="number" value={item.quantity} onChange={(e) => updateLineItem(index, "quantity", e.target.value)} />
            </div>
            <div className="md:col-span-2">
              <InputField label="Rate" name={`rate-${index}`} type="number" value={item.rate} onChange={(e) => updateLineItem(index, "rate", e.target.value)} />
            </div>
            <div className="md:col-span-2">
              <button type="button" onClick={() => removeLineItem(index)} className="w-full px-3 py-2 border border-red-300 text-red-600 rounded hover:bg-red-50">
                Remove
              </button>
            </div>
            <div className="md:col-span-12 text-right text-sm text-gray-600">
              Line Amount: {(Number(item.quantity || 0) * Number(item.rate || 0)).toFixed(2)}
            </div>
          </div>
        ))}
      </div>

      <button type="button" onClick={addLineItem} className="px-3 py-2 border border-gray-300 rounded hover:bg-gray-50">
        + Add Line Item
      </button>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <SelectField label="Discount Type" name="discountType" options={[{ value: "flat", label: "Flat" }, { value: "percent", label: "Percent" }]} value={formData.discountType} onChange={(e) => updateField("discountType", e.target.value)} />
        <InputField label="Discount Value" name="discountValue" type="number" value={formData.discountValue} onChange={(e) => updateField("discountValue", e.target.value)} />
        <InputField label="Tax (%)" name="taxPercent" type="number" value={formData.taxPercent} onChange={(e) => updateField("taxPercent", e.target.value)} />
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
        <div className="bg-gray-50 p-3 rounded-lg"><p className="text-gray-500">Subtotal</p><p className="font-semibold">{totals.subtotal.toFixed(2)}</p></div>
        <div className="bg-gray-50 p-3 rounded-lg"><p className="text-gray-500">Discount</p><p className="font-semibold">{totals.discount.toFixed(2)}</p></div>
        <div className="bg-gray-50 p-3 rounded-lg"><p className="text-gray-500">Tax</p><p className="font-semibold">{totals.tax.toFixed(2)}</p></div>
        <div className="bg-green-50 p-3 rounded-lg"><p className="text-gray-500">Total</p><p className="font-semibold">{totals.total.toFixed(2)}</p></div>
      </div>

      <TextAreaField label="Notes" name="notes" placeholder="Customer-visible notes" rows={3} value={formData.notes} onChange={(e) => updateField("notes", e.target.value)} />
      <TextAreaField label="Terms & Conditions" name="terms" placeholder="Payment terms, warranty notes, etc." rows={3} value={formData.terms} onChange={(e) => updateField("terms", e.target.value)} />
    </FormWrapper>
  );
}
