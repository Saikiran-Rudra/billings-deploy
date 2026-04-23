"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import FormWrapper from "@/components/form/FormWrapper";
import InputField from "@/components/form/InputField";
import SelectField from "@/components/form/SelectField";
import TextAreaField from "@/components/form/TextAreaField";
import { api } from "@/lib/api-client";
import { returnFormConfig } from "@/data/return-form";
import { useAuth } from "@/hooks/use-auth";

interface InvoiceOption {
  _id: string;
  invoiceNumber: string;
  customerName: string;
}

interface FormData {
  returnId: string;
  date: string;
  originalInvoice: string;
  customer: string;
  items: string;
  amount: string;
  status: "pending" | "approved" | "rejected" | "completed";
  notes: string;
}

export default function NewReturnPage() {
  const router = useRouter();
  const auth = useAuth();

  const [invoices, setInvoices] = useState<InvoiceOption[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [formData, setFormData] = useState<FormData>({
    returnId: "",
    date: "",
    originalInvoice: "",
    customer: "",
    items: "",
    amount: "",
    status: "pending",
    notes: "",
  });

  // Fetch invoices for the dropdown
  useEffect(() => {
    const fetchInvoices = async () => {
      try {
        const res = await api.get<{ invoices: InvoiceOption[] }>("/invoices");
        setInvoices(res.invoices);
      } catch {
        // Keep form usable even if invoice fetch fails
      }
    };

    fetchInvoices();
  }, []);

  // Auto-generate Return ID
  useEffect(() => {
    if (!formData.returnId) {
      const today = new Date();
      const generated = `SR-${today.getFullYear()}${String(today.getMonth() + 1).padStart(2, "0")}${String(today.getDate()).padStart(2, "0")}-${Math.floor(Math.random() * 900 + 100)}`;
      setFormData((prev) => ({ ...prev, returnId: generated }));
    }
  }, [formData.returnId]);

  const invoiceOptions = useMemo(
    () => (invoices || []).map((inv) => ({ value: inv.invoiceNumber, label: `${inv.invoiceNumber} — ${inv.customerName}` })),
    [invoices]
  );

  // Build dynamic config with options
  const formConfigWithOptions = useMemo(
    () =>
      returnFormConfig.map((field) => {
        if (field.name === "originalInvoice") {
          return { ...field, options: invoiceOptions };
        }
        return field;
      }),
    [invoiceOptions]
  );

  const handleChange = (fieldName: string, value: string) => {
    // Auto-fill customer when originalInvoice is selected
    if (fieldName === "originalInvoice") {
      const selectedInvoice = invoices.find((inv) => inv.invoiceNumber === value);
      setFormData((prev) => ({
        ...prev,
        [fieldName]: value,
        customer: selectedInvoice?.customerName || prev.customer,
      }));
    } else {
      setFormData((prev) => ({ ...prev, [fieldName]: value }));
    }
    setError("");
  };

  const onSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!formData.returnId || !formData.date) {
      setError("Return ID and date are required.");
      return;
    }

    if (!formData.originalInvoice) {
      setError("Please select an original invoice.");
      return;
    }

    if (!formData.customer.trim()) {
      setError("Customer is required.");
      return;
    }

    if (!formData.items.trim()) {
      setError("Items description is required.");
      return;
    }

    if (!Number.isFinite(Number(formData.amount)) || Number(formData.amount) < 0) {
      setError("Amount must be a valid non-negative number.");
      return;
    }

    setIsSubmitting(true);

    try {
      await api.post<{ message: string }>("/sales-returns", {
        // Convert to string to ensure it's a valid ObjectId string
        companyId: typeof auth.user?.companyId === 'string' 
          ? auth.user.companyId 
          : (auth.user?.companyId as any)?.toString?.() || String(auth.user?.companyId),
        returnId: formData.returnId,
        date: formData.date,
        originalInvoice: formData.originalInvoice,
        customer: formData.customer,
        items: formData.items,
        amount: Number(formData.amount),
        status: formData.status,
        notes: formData.notes,
      });

      setSuccess("Sales return created successfully.");
      setTimeout(() => router.push("/sales/returns"), 500);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to create sales return");
      setIsSubmitting(false);
    }
  };

  return (
    <FormWrapper
      title="New Sales Return"
      onSubmit={onSubmit}
      submitLabel="Save Return"
      isLoading={isSubmitting}
      error={error}
      success={success}
    >
      <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
        {formConfigWithOptions.map((field) => (
          <div key={field.name} className={field.gridSpan || "md:col-span-12"}>
            {field.type === "textarea" ? (
              <TextAreaField
                label={field.label}
                name={field.name}
                placeholder={field.placeholder}
                value={formData[field.name as keyof FormData]}
                onChange={(e) => handleChange(field.name, e.target.value)}
                rows={3}
              />
            ) : field.type === "select" ? (
              <SelectField
                label={field.label}
                name={field.name}
                placeholder={field.placeholder}
                value={formData[field.name as keyof FormData]}
                onChange={(e) => handleChange(field.name, e.target.value)}
                options={field.options || []}
              />
            ) : (
              <InputField
                label={field.label}
                name={field.name}
                type={field.type}
                placeholder={field.placeholder}
                value={formData[field.name as keyof FormData]}
                onChange={(e) => handleChange(field.name, e.target.value)}
                required={field.required}
              />
            )}
          </div>
        ))}
      </div>
    </FormWrapper>
  );
}
