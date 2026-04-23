"use client";

import { useEffect, useState, FormEvent, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import FormWrapper from "@/components/form/FormWrapper";
import InputField from "@/components/form/InputField";
import SelectField from "@/components/form/SelectField";
import TextAreaField from "@/components/form/TextAreaField";
import { useSuppliers } from "@/hooks/use-suppliers";
import { getSupplierFormConfig, getSupplierInitialValues, getVisibleSupplierFields } from "@/data/supplier-form.config";
import { supplierSchema, type SupplierFormData } from "@/lib/validations/supplier";

export default function EditSupplierPage() {
  const params = useParams();
  const router = useRouter();
  const supplierId = params.id as string;

  const { fetchSupplierById, updateSupplier } = useSuppliers();
  const formConfig = useMemo(() => getSupplierFormConfig(), []);

  const [formData, setFormData] = useState<Partial<SupplierFormData>>(
    getSupplierInitialValues()
  );
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const visibleFields = useMemo(
    () => getVisibleSupplierFields(formConfig, formData),
    [formConfig, formData]
  );

  // Fetch supplier data on mount
  useEffect(() => {
    const loadSupplier = async () => {
      try {
        setLoading(true);
        const data = await fetchSupplierById(supplierId);
        if (data) {
          setFormData(data);
        }
        setError("");
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load supplier");
      } finally {
        setLoading(false);
      }
    };

    if (supplierId) {
      loadSupplier();
    }
  }, [supplierId]);

  const handleChange = (fieldName: string, value: string | boolean | number | undefined) => {
    setFormData((prev) => {
      // Handle nested fields (e.g., address.city)
      if (fieldName.includes(".")) {
        const [section, field] = fieldName.split(".");
        return {
          ...prev,
          [section]: {
            ...(prev as any)[section],
            [field]: value,
          },
        };
      }
      return { ...prev, [fieldName]: value };
    });

    // Clear field-specific error when user starts editing
    if (errors[fieldName]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[fieldName];
        return newErrors;
      });
    }

    setError("");
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setErrors({});
    setSubmitting(true);

    try {
      // Validate form data
      const validationResult = supplierSchema.safeParse(formData);

      if (!validationResult.success) {
        const fieldErrors: Record<string, string> = {};
        validationResult.error.errors.forEach((err) => {
          const fieldName = err.path.join(".");
          fieldErrors[fieldName] = err.message;
        });
        setErrors(fieldErrors);
        setError("Please fix the errors in the form");
        setSubmitting(false);
        return;
      }

      await updateSupplier(supplierId, validationResult.data);

      setSuccess("Supplier updated successfully!");
      setTimeout(() => {
        router.push(`/inventory/suppliers/${supplierId}`);
      }, 1500);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update supplier");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="flex justify-center items-center h-64">
          <div className="text-gray-500">Loading supplier...</div>
        </div>
      </div>
    );
  }

  return (
    <FormWrapper
      title="Edit Supplier"
      onSubmit={handleSubmit}
      submitLabel="Update Supplier"
      error={error}
      success={success}
      isLoading={submitting}
    >
      <div className="space-y-8">
        {/* ========== SECTION 1: BASIC DETAILS ========== */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">
            Basic Details
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
            {visibleFields
              .filter((f) =>
                ["supplierName", "companyName", "email", "phone"].includes(
                  f.name as string
                )
              )
              .map((field) =>
                renderField(field, formData, errors, handleChange)
              )}
          </div>
        </div>

        {/* ========== SECTION 2: GST INFO ========== */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">
            GST Information
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
            {visibleFields
              .filter((f) =>
                ["isGSTRegistered", "gstNumber"].includes(f.name as string)
              )
              .map((field) =>
                renderField(field, formData, errors, handleChange)
              )}
          </div>
        </div>

        {/* ========== SECTION 3: BILLING & SHIPPING ADDRESS ========== */}
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Billing Address */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">
                Billing Address
              </h3>
              <div className="grid grid-cols-1 gap-4">
                {visibleFields
                  .filter((f) =>
                    [
                      "billingAddress.street",
                      "billingAddress.city",
                      "billingAddress.state",
                      "billingAddress.pincode",
                      "billingAddress.country",
                    ].includes(f.name as string)
                  )
                  .map((field) =>
                    renderField(field, formData, errors, handleChange)
                  )}
              </div>
            </div>

            {/* Shipping Address */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">
                Shipping Address
              </h3>
              <div className="grid grid-cols-1 gap-4">
                {visibleFields
                  .filter((f) =>
                    [
                      "shippingAddress.street",
                      "shippingAddress.city",
                      "shippingAddress.state",
                      "shippingAddress.pincode",
                      "shippingAddress.country",
                    ].includes(f.name as string)
                  )
                  .map((field) =>
                    renderField(field, formData, errors, handleChange)
                  )}
              </div>
            </div>
          </div>
        </div>

        {/* ========== SECTION 4: BUSINESS INFO ========== */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">
            Business Information
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
            {visibleFields
              .filter((f) =>
                ["paymentTerms", "openingBalance", "notes", "status"].includes(
                  f.name as string
                )
              )
              .map((field) =>
                renderField(field, formData, errors, handleChange)
              )}
          </div>
        </div>
      </div>
    </FormWrapper>
  );
}

/**
 * Render individual form field based on type
 * Supports dynamic options (functions) and readonly fields
 */
function renderField(
  field: any,
  formData: Partial<SupplierFormData>,
  errors: Record<string, string>,
  handleChange: (name: string, value: any) => void
) {
  const getNestedValue = (obj: any, path: string) => {
    return path.split(".").reduce((current, prop) => current?.[prop], obj);
  };

  const fieldValue = getNestedValue(formData, field.name as string) ?? (field.defaultValue || "");
  const fieldError = errors[field.name as string];

  // Resolve dynamic options (if options is a function, call it with formData)
  const resolvedOptions = typeof field.options === "function" ? field.options(formData) : (field.options || []);

  return (
    <div key={field.name} className={field.gridSpan || "md:col-span-12"}>
      {field.type === "textarea" ? (
        <>
          <TextAreaField
            label={field.label}
            name={field.name as string}
            placeholder={field.placeholder}
            value={fieldValue || ""}
            onChange={(e) => handleChange(field.name as string, e.target.value)}
            rows={3}
            required={field.required}
            disabled={field.readonly}
          />
          {field.help && <p className="text-xs text-gray-500 mt-1">{field.help}</p>}
          {fieldError && <p className="text-sm text-red-600 mt-1">{fieldError}</p>}
        </>
      ) : field.type === "toggle" ? (
        <>
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={fieldValue || false}
              onChange={(e) =>
                handleChange(field.name as string, e.target.checked)
              }
              disabled={field.readonly}
              className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            />
            <span className="text-sm font-medium text-gray-700">{field.label}</span>
          </label>
          {field.help && <p className="text-xs text-gray-500 mt-1">{field.help}</p>}
          {fieldError && <p className="text-sm text-red-600 mt-1">{fieldError}</p>}
        </>
      ) : field.type === "select" ? (
        <>
          <SelectField
            label={field.label}
            name={field.name as string}
            options={resolvedOptions}
            value={fieldValue || ""}
            onChange={(e) =>
              handleChange(field.name as string, e.target.value)
            }
            placeholder={field.placeholder}
            required={field.required}
            disabled={field.readonly}
          />
          {field.help && <p className="text-xs text-gray-500 mt-1">{field.help}</p>}
          {fieldError && <p className="text-sm text-red-600 mt-1">{fieldError}</p>}
        </>
      ) : (
        <>
          <InputField
            label={field.label}
            name={field.name as string}
            type={field.type}
            placeholder={field.placeholder}
            value={fieldValue || ""}
            onChange={(e) =>
              handleChange(field.name as string, e.target.value)
            }
            required={field.required}
            readOnly={field.readonly}
            step={field.step || (field.type === "number" ? "0.01" : undefined)}
            min={field.min}
            max={field.max}
          />
          {field.help && <p className="text-xs text-gray-500 mt-1">{field.help}</p>}
          {fieldError && <p className="text-sm text-red-600 mt-1">{fieldError}</p>}
        </>
      )}
    </div>
  );
}

