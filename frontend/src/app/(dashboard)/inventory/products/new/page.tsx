"use client";
import { useState, FormEvent, useMemo, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useProductOptions } from "@/hooks/useProductOptions";
import { useProductConfig } from "@/hooks/useProductConfig";
import { useSkuGenerator } from "@/hooks/useSkuGenerator";
import { getProductFormConfig } from "@/data/product-form.dynamic";
import { useProfitMargin } from "@/hooks/useProfitMargin";
import FormWrapper from "@/components/form/FormWrapper";
import InputField from "@/components/form/InputField";
import SelectField from "@/components/form/SelectField";
import TextAreaField from "@/components/form/TextAreaField";
import SKUSuggestionInput from "@/components/form/SKUSuggestionInput";
import ProductTypeSelector from "@/components/form/ProductTypeSelector";
import { api } from "@/lib/api-client";
import { useAuth } from "@/hooks/use-auth";

interface FormData {
  productName: string;
  sku: string;
  category: string;
  productType: "goods" | "service";
  description: string;
  salePrice: string;
  purchasePrice: string;
  taxType: "inclusive" | "exclusive";
  barcode: string;
  unit: string;
  gst: string;
  status: string;
}

export default function NewProductPage() {
  const router = useRouter();
  const auth = useAuth();
  const { categoryOptions, unitOptions, gstOptions, isLoading: configLoading } = useProductOptions();
  const { config } = useProductConfig();
  const { sku, isLoading: skuLoading, error: skuError, generateSKU } = useSkuGenerator();
  
  const formConfig = useMemo(
    () => getProductFormConfig(categoryOptions, unitOptions, gstOptions),
    [categoryOptions, unitOptions, gstOptions]
  );

  const [formData, setFormData] = useState<FormData>({
    productName: "",
    sku: "",
    category: "",
    productType: "goods",
    description: "",
    salePrice: "",
    purchasePrice: "",
    taxType: "exclusive",
    barcode: "",
    unit: unitOptions.length > 0 ? (unitOptions[0].value as string) : "Pcs",
    gst: "0",
    status: "active",
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const profitMargin = useProfitMargin(formData.salePrice, formData.purchasePrice);

  // Auto-fill SKU when generated
  useEffect(() => {
    if (sku) {
      setFormData((prev) => ({ ...prev, sku }));
    }
  }, [sku]);

  const handleChange = (fieldName: string, value: string | boolean) => {
    if (fieldName === "category" && typeof value === "string" && value !== formData.category) {
      // Auto-generate SKU when category changes
      generateSKU(value);
    }
    setFormData((prev) => ({ ...prev, [fieldName]: value }));
    setError("");
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    try {
      if (!formData.productName.trim()) {
        setError("Product name is required");
        setLoading(false);
        return;
      }
      if (!formData.sku.trim()) {
        setError("SKU is required");
        setLoading(false);
        return;
      }
      if (!formData.salePrice || parseFloat(formData.salePrice) < 0) {
        setError("Valid sale price is required");
        setLoading(false);
        return;
      }
      // Purchase price only required for goods
      if (formData.productType === "goods" && (!formData.purchasePrice || parseFloat(formData.purchasePrice) < 0)) {
        setError("Valid purchase price is required for goods");
        setLoading(false);
        return;
      }

      const payload: any = {
        // Convert to string to ensure it's a valid ObjectId string
        companyId: typeof auth.user?.companyId === 'string' 
          ? auth.user.companyId 
          : (auth.user?.companyId as any)?.toString?.() || String(auth.user?.companyId),
        productName: formData.productName.trim(),
        sku: formData.sku.trim(),
        category: formData.category,
        productType: formData.productType,
        description: formData.description,
        salePrice: parseFloat(formData.salePrice),
        taxType: formData.taxType,
        barcode: formData.barcode || undefined,
        unit: formData.unit,
        gst: parseFloat(formData.gst) || undefined,
        status: formData.status,
      };

      // Add purchase price only for goods
      if (formData.productType === "goods") {
        payload.purchasePrice = parseFloat(formData.purchasePrice);
      }

      const response = await api.post<{ message: string; product: unknown }>("/products", payload);

      setSuccess(response.message);
      setTimeout(() => {
        router.push("/inventory/products");
      }, 1500);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create product");
    } finally {
      setLoading(false);
    }
  };

  return (
    <FormWrapper
      title="Add New Product"
      onSubmit={handleSubmit}
      submitLabel="Save Product"
      error={error}
      success={success}
      isLoading={loading || configLoading}
    >
      {configLoading ? (
        <div className="text-center py-8 text-gray-500">
          Loading product configuration...
        </div>
      ) : (
        <>
          {/* Product Type Selection - Top of Form */}
          <div className="mb-6">
            <label className="block text-sm font-semibold text-gray-900 mb-3">Product Type</label>
            <div className="flex gap-6">
              <label className="flex items-center cursor-pointer">
                <input
                  type="radio"
                  name="productType"
                  value="goods"
                  checked={formData.productType === "goods"}
                  onChange={(e) => handleChange("productType", e.target.value)}
                  className="w-4 h-4 text-blue-600 cursor-pointer"
                />
                <span className="ml-2 text-sm font-medium text-gray-700">Goods</span>
              </label>
              <label className="flex items-center cursor-pointer">
                <input
                  type="radio"
                  name="productType"
                  value="service"
                  checked={formData.productType === "service"}
                  onChange={(e) => handleChange("productType", e.target.value)}
                  className="w-4 h-4 text-blue-600 cursor-pointer"
                />
                <span className="ml-2 text-sm font-medium text-gray-700">Service</span>
              </label>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
          {formConfig.map((field) => {
            // Special handling for SKU field - readonly with auto-generation
            if (field.name === "sku") {
              return (
                <div key={field.name} className={field.gridSpan || "md:col-span-12"}>
                  <label htmlFor="sku" className="block text-sm font-medium text-gray-700 mb-1">
                    {field.label}
                    {skuLoading && <span className="text-blue-600 ml-2">Generating...</span>}
                  </label>
                  <div className="flex gap-2 items-end">
                    <input
                      id="sku"
                      type="text"
                      placeholder="Auto-generated when category is selected"
                      value={formData.sku}
                      readOnly
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-600 cursor-not-allowed"
                    />
                  </div>
                  {skuError && <p className="mt-1 text-sm text-red-600">{skuError}</p>}
                  {!skuError && formData.sku && (
                    <p className="mt-1 text-sm text-green-600">✓ SKU auto-generated</p>
                  )}
                </div>
              );
            }
            
            return (
            <div key={field.name} className={field.gridSpan || "md:col-span-12"}>
              {field.type === "textarea" ? (
                <TextAreaField
                  label={field.label}
                  name={field.name}
                  placeholder={field.placeholder}
                  value={(formData[field.name as keyof FormData] as string) || ""}
                  onChange={(e) => handleChange(field.name, e.target.value)}
                  rows={3}
                />
              ) : field.type === "select" ? (
                <SelectField
                  label={field.label}
                  name={field.name}
                  options={field.options || []}
                  value={(formData[field.name as keyof FormData] as string) || ""}
                  onChange={(e) => handleChange(field.name, e.target.value)}
                  placeholder={field.placeholder}
                />
              ) : (
                <InputField
                  label={field.label}
                  name={field.name}
                  type={field.type}
                  placeholder={field.placeholder}
                  value={(formData[field.name as keyof FormData] as string) || ""}
                  onChange={(e) => handleChange(field.name, e.target.value)}
                  required={field.name === "purchasePrice" ? formData.productType === "goods" : field.required}
                  readOnly={(field as any).readOnly}
                />
              )}
            </div>
            );
          })}
          
          {/* Profit Margin Display - after purchase price */}
          {formData.salePrice && formData.purchasePrice && formData.productType === "goods" && (
            <div className="md:col-span-6">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Profit Margin
                </label>
                <div className="text-2xl font-bold text-blue-600">
                  ₹{profitMargin.profitMargin.toFixed(2)}
                </div>
                <p className="text-sm text-gray-600 mt-1">
                  {profitMargin.profitMarginPercentage.toFixed(2)}% ROI
                </p>
              </div>
            </div>
          )}

          {/* Tax Type Field */}
          <div className="md:col-span-6">
            <SelectField
              label="Tax Type"
              name="taxType"
              options={[
                { label: "Inclusive", value: "inclusive" },
                { label: "Exclusive", value: "exclusive" },
              ]}
              value={formData.taxType}
              onChange={(e) => handleChange("taxType", e.target.value)}
            />
          </div>

          {/* Barcode Field */}
          <div className="md:col-span-6">
            <InputField
              label="Barcode (Optional)"
              name="barcode"
              type="text"
              placeholder="Enter product barcode"
              value={formData.barcode}
              onChange={(e) => handleChange("barcode", e.target.value)}
            />
          </div>

          {/* Hidden for Services - show only for Goods */}
          {formData.productType === "service" && (
            <div className="md:col-span-12">
              <div className="bg-blue-50 border border-blue-200 rounded p-3">
                <p className="text-sm text-blue-800">
                  <strong>ℹ️ Note:</strong> Stock fields (Opening Stock & Minimum Stock) are disabled for services.
                </p>
              </div>
            </div>
          )}
        </div>
        </>
      )}
    </FormWrapper>
  );
}
