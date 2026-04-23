"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import InputField from "@/components/form/InputField";
import SelectField from "@/components/form/SelectField";
import TextAreaField from "@/components/form/TextAreaField";
import { api } from "@/lib/api-client";

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

interface InvoiceRecord {
  _id: string;
  invoiceNumber: string;
  invoiceDate: string;
  dueDate: string;
  customerId?: string;
  customerName: string;
  lineItems: InvoiceLineItem[];
  discountType: "flat" | "percent";
  discountValue: number;
  taxPercent: number;
  notes: string;
  terms: string;
  status: "draft" | "sent" | "partially_paid" | "paid" | "overdue";
}

interface InvoiceLineItem {
  itemName: string;
  description: string;
  quantity: number;
  rate: number;
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

export default function EditInvoicePage() {
  const router = useRouter();
  const params = useParams();
  const invoiceId = params.id as string;

  const [customers, setCustomers] = useState<CustomerOption[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [notFound, setNotFound] = useState(false);

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

  // Fetch invoice data and customers
  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const [invoiceRes, customersRes] = await Promise.all([
          api.get<{ invoice: InvoiceRecord }>(`/invoices/${invoiceId}`),
          api.get<{ success: boolean; message: string; data: CustomerOption[] }>("/customers"),
        ]);

        const invoice = (invoiceRes as { invoice: InvoiceRecord }).invoice;
        const customers = (customersRes as { success: boolean; message: string; data: CustomerOption[] }).data;
        setCustomers(customers);

        // Pre-fill the form with invoice data
        setFormData({
          invoiceNumber: invoice.invoiceNumber,
          invoiceDate: invoice.invoiceDate,
          dueDate: invoice.dueDate,
          customerId: invoice.customerId || "",
          customerName: invoice.customerName,
          discountType: invoice.discountType,
          discountValue: String(invoice.discountValue),
          taxPercent: String(invoice.taxPercent),
          notes: invoice.notes,
          terms: invoice.terms,
          status: invoice.status,
        });

        setLineItems(
          invoice.lineItems.length
            ? invoice.lineItems.map((item) => ({
                itemName: item.itemName,
                description: item.description,
                quantity: String(item.quantity),
                rate: String(item.rate),
              }))
            : [defaultLineItem()]
        );

        setCustomers((customersRes as { success: boolean; message: string; data: CustomerOption[] }).data);
      } catch (err: unknown) {
        if (err instanceof Error && err.message.includes("404")) {
          setNotFound(true);
        } else {
          setError(err instanceof Error ? err.message : "Failed to load invoice");
        }
      } finally {
        setIsLoading(false);
      }
    };

    if (invoiceId) {
      fetchData();
    }
  }, [invoiceId]);

  const totals = useMemo(
    () => calculateTotals(lineItems, formData.discountType, formData.discountValue, formData.taxPercent),
    [lineItems, formData.discountType, formData.discountValue, formData.taxPercent]
  );

  const customerOptions = useMemo(
    () => (customers || []).map((customer) => ({ value: customer._id, label: customer.displayName })),
    [customers]
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
      await api.put<{ invoice: InvoiceRecord }>(`/invoices/${invoiceId}`, {
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

      setSuccess("Invoice updated successfully.");
      setTimeout(() => router.push("/sales/invoices"), 500);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to update invoice");
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="text-center py-10 text-gray-500">Loading invoice...</div>
      </div>
    );
  }

  if (notFound) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4">
          Invoice not found. It may have been deleted.
        </div>
        <button
          onClick={() => router.back()}
          className="px-4 py-2 border border-gray-300 rounded hover:bg-gray-50"
        >
          ← Back
        </button>
      </div>
    );
  }

  return (
    <div className="p-6 w-full">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold">Edit Invoice</h2>
        <button
          onClick={() => router.back()}
          className="px-4 py-2 border border-gray-300 rounded hover:bg-gray-50 transition"
        >
          ← Back
        </button>
      </div>

      {error && <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm mb-4">{error}</div>}
      {success && <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg text-sm mb-4">{success}</div>}

      <form onSubmit={onSubmit} className="bg-white p-6 rounded-xl shadow-md space-y-6 w-full">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <InputField
          label="Invoice Number"
          name="invoiceNumber"
          value={formData.invoiceNumber}
          onChange={(e) => updateField("invoiceNumber", e.target.value)}
          required
        />
        <InputField
          label="Invoice Date"
          name="invoiceDate"
          type="date"
          value={formData.invoiceDate}
          onChange={(e) => updateField("invoiceDate", e.target.value)}
          required
        />
        <SelectField
          label="Customer"
          name="customerId"
          placeholder="Select Customer"
          options={customerOptions}
          value={formData.customerId}
          onChange={(e) => {
            const selected = customers.find((c) => c._id === e.target.value);
            setFormData((prev) => ({ ...prev, customerId: e.target.value, customerName: selected?.displayName || "" }));
          }}
        />
        <InputField
          label="Due Date"
          name="dueDate"
          type="date"
          value={formData.dueDate}
          onChange={(e) => updateField("dueDate", e.target.value)}
          required
        />
        <SelectField
          label="Status"
          name="status"
          options={[
            { value: "draft", label: "Draft" },
            { value: "sent", label: "Sent" },
            { value: "partially_paid", label: "Partially Paid" },
            { value: "paid", label: "Paid" },
            { value: "overdue", label: "Overdue" },
          ]}
          value={formData.status}
          onChange={(e) => updateField("status", e.target.value)}
        />
      </div>

      <h3 className="text-lg font-semibold">Line Items</h3>
      <div className="space-y-3">
        {lineItems.map((item, index) => (
          <div key={`line-item-${index}`} className="grid grid-cols-1 md:grid-cols-12 gap-2 items-end border border-gray-200 rounded-lg p-3">
            <div className="md:col-span-3">
              <InputField
                label="Item"
                name={`item-${index}`}
                value={item.itemName}
                onChange={(e) => updateLineItem(index, "itemName", e.target.value)}
              />
            </div>
            <div className="md:col-span-3">
              <InputField
                label="Description"
                name={`description-${index}`}
                value={item.description}
                onChange={(e) => updateLineItem(index, "description", e.target.value)}
              />
            </div>
            <div className="md:col-span-2">
              <InputField
                label="Quantity"
                name={`qty-${index}`}
                type="number"
                value={item.quantity}
                onChange={(e) => updateLineItem(index, "quantity", e.target.value)}
              />
            </div>
            <div className="md:col-span-2">
              <InputField
                label="Rate"
                name={`rate-${index}`}
                type="number"
                value={item.rate}
                onChange={(e) => updateLineItem(index, "rate", e.target.value)}
              />
            </div>
            <div className="md:col-span-2">
              <button
                type="button"
                onClick={() => removeLineItem(index)}
                className="w-full px-3 py-2 border border-red-300 text-red-600 rounded hover:bg-red-50"
              >
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
        <SelectField
          label="Discount Type"
          name="discountType"
          options={[
            { value: "flat", label: "Flat" },
            { value: "percent", label: "Percent" },
          ]}
          value={formData.discountType}
          onChange={(e) => updateField("discountType", e.target.value)}
        />
        <InputField
          label="Discount Value"
          name="discountValue"
          type="number"
          value={formData.discountValue}
          onChange={(e) => updateField("discountValue", e.target.value)}
        />
        <InputField
          label="Tax (%)"
          name="taxPercent"
          type="number"
          value={formData.taxPercent}
          onChange={(e) => updateField("taxPercent", e.target.value)}
        />
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
        <div className="bg-gray-50 p-3 rounded-lg">
          <p className="text-gray-500">Subtotal</p>
          <p className="font-semibold">{totals.subtotal.toFixed(2)}</p>
        </div>
        <div className="bg-gray-50 p-3 rounded-lg">
          <p className="text-gray-500">Discount</p>
          <p className="font-semibold">{totals.discount.toFixed(2)}</p>
        </div>
        <div className="bg-gray-50 p-3 rounded-lg">
          <p className="text-gray-500">Tax</p>
          <p className="font-semibold">{totals.tax.toFixed(2)}</p>
        </div>
        <div className="bg-green-50 p-3 rounded-lg">
          <p className="text-gray-500">Total</p>
          <p className="font-semibold">{totals.total.toFixed(2)}</p>
        </div>
      </div>

      <TextAreaField
        label="Notes"
        name="notes"
        placeholder="Customer-visible notes"
        rows={3}
        value={formData.notes}
        onChange={(e) => updateField("notes", e.target.value)}
      />
      <TextAreaField
        label="Terms & Conditions"
        name="terms"
        placeholder="Payment terms, warranty notes, etc."
        rows={3}
        value={formData.terms}
        onChange={(e) => updateField("terms", e.target.value)}
      />

      <div className="flex justify-end gap-2">
        <button
          type="button"
          onClick={() => router.back()}
          className="px-4 py-2 border border-gray-300 rounded hover:bg-gray-50 transition"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isSubmitting}
          className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg transition disabled:opacity-50"
        >
          {isSubmitting ? "Saving..." : "Save Changes"}
        </button>
      </div>
      </form>
    </div>
  );
}
