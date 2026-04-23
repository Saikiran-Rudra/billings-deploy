"use client";

import { useState, FormEvent } from "react";
import { X, Loader2 } from "lucide-react";
import InputField from "@/components/form/InputField";
import SelectField from "@/components/form/SelectField";
import TextAreaField from "@/components/form/TextAreaField";
import { useSuppliers } from "@/hooks/use-suppliers";
import { supplierSchema, type SupplierFormData } from "@/lib/validations/supplier";
import {
  getSupplierFormConfig,
  getSupplierInitialValues,
  getVisibleSupplierFields,
} from "@/data/supplier-form.config";

interface AddVendorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onVendorCreated: (vendorId: string) => void;
}

/**
 * AddVendorModal Component
 * Inline modal for creating new vendors/suppliers without navigation
 * Opens overlay on top of purchase form
 */
export default function AddVendorModal({
  isOpen,
  onClose,
  onVendorCreated,
}: AddVendorModalProps) {
  const { createSupplier } = useSuppliers();
  const formConfig = getSupplierFormConfig();

  const [formData, setFormData] = useState<Partial<SupplierFormData>>(
    getSupplierInitialValues()
  );
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const visibleFields = getVisibleSupplierFields(formConfig, formData);

  const handleChange = (
    fieldName: string,
    value: string | boolean | number | undefined
  ) => {
    setFormData((prev) => {
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
    setErrors({});
    setLoading(true);

    try {
      const validationResult = supplierSchema.safeParse(formData);

      if (!validationResult.success) {
        const fieldErrors: Record<string, string> = {};
        validationResult.error.errors.forEach((err) => {
          const fieldName = err.path.join(".");
          fieldErrors[fieldName] = err.message;
        });
        setErrors(fieldErrors);
        setError("Please fix the errors in the form");
        setLoading(false);
        return;
      }

      const newSupplier = await createSupplier(validationResult.data);

      // Notify parent component of new vendor creation
      onVendorCreated(newSupplier._id || newSupplier.id);

      // Reset form and close modal
      setFormData(getSupplierInitialValues());
      setErrors({});
      setError("");
      onClose();
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to create vendor";
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 flex items-center justify-between p-6 border-b border-gray-200 bg-white">
          <h2 className="text-2xl font-bold text-gray-900">Add New Vendor</h2>
          <button
            onClick={onClose}
            disabled={loading}
            className="text-gray-400 hover:text-gray-600 disabled:opacity-50 transition"
          >
            <X size={24} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-sm text-red-800">{error}</p>
            </div>
          )}

          {/* Form Fields Grid */}
          <div className="grid grid-cols-12 gap-6">
            {visibleFields.map((field) => {
              const fieldValue = (formData as any)[field.name] || "";
              const fieldError = errors[field.name] || "";

              if (field.type === "select") {
                return (
                  <div
                    key={field.name}
                    className={field.gridSpan || "col-span-12"}
                  >
                    <SelectField
                      name={field.name}
                      label={field.label}
                      value={fieldValue}
                      onChange={(e) => handleChange(field.name, e.target.value)}
                      options={
                        typeof field.options === "function"
                          ? field.options(formData)
                          : field.options || []
                      }
                      placeholder={field.placeholder}
                      required={field.required}
                      error={fieldError}
                      help={field.help}
                      disabled={loading || field.readonly}
                    />
                  </div>
                );
              } else if (field.type === "toggle") {
                return (
                  <div
                    key={field.name}
                    className={field.gridSpan || "col-span-12"}
                  >
                    <label className="flex items-center gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={fieldValue || false}
                        onChange={(e) =>
                          handleChange(field.name, e.target.checked)
                        }
                        disabled={loading}
                        className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500 disabled:opacity-50"
                      />
                      <span className="text-sm font-medium text-gray-700">
                        {field.label}
                      </span>
                    </label>
                    {field.help && (
                      <p className="text-xs text-gray-500 mt-1">{field.help}</p>
                    )}
                  </div>
                );
              } else if (field.type === "textarea") {
                return (
                  <div
                    key={field.name}
                    className={field.gridSpan || "col-span-12"}
                  >
                    <TextAreaField
                      name={field.name}
                      label={field.label}
                      value={fieldValue}
                      onChange={(e) => handleChange(field.name, e.target.value)}
                      placeholder={field.placeholder}
                      required={field.required}
                      error={fieldError}
                      help={field.help}
                      disabled={loading}
                    />
                  </div>
                );
              } else {
                return (
                  <div
                    key={field.name}
                    className={field.gridSpan || "col-span-12"}
                  >
                    <InputField
                      name={field.name}
                      label={field.label}
                      type={field.type}
                      value={fieldValue}
                      onChange={(e) => handleChange(field.name, e.target.value)}
                      placeholder={field.placeholder}
                      required={field.required}
                      error={fieldError}
                      help={field.help}
                      disabled={loading || field.readonly}
                    />
                  </div>
                );
              }
            })}
          </div>

          {/* Footer Buttons */}
          <div className="flex gap-3 pt-6 border-t border-gray-200 sticky bottom-0 bg-white">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 disabled:opacity-50 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-medium rounded-lg flex items-center justify-center gap-2 transition"
            >
              {loading && <Loader2 size={18} className="animate-spin" />}
              {loading ? "Creating..." : "Create Vendor"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
