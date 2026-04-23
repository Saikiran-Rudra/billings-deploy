"use client";
import { useEffect, useState, FormEvent, useMemo } from "react";
import { useRouter, useParams } from "next/navigation";
import { useProductOptions } from "@/hooks/useProductOptions";
import { useProductConfig } from "@/hooks/useProductConfig";
import { useProfitMargin } from "@/hooks/useProfitMargin";
import { useSkuGenerator } from "@/hooks/useSkuGenerator";
import { getProductFormConfig } from "@/data/product-form.dynamic";
import FormWrapper from "@/components/form/FormWrapper";
import InputField from "@/components/form/InputField";
import SelectField from "@/components/form/SelectField";
import TextAreaField from "@/components/form/TextAreaField";
import SKUSuggestionInput from "@/components/form/SKUSuggestionInput";
import { api } from "@/lib/api-client";
import { Product } from "@/types";

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

export default function EditProductPage() {
  const router = useRouter();
  const params = useParams();
  const productId = params.id as string;

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
  const [skuChanged, setSkuChanged] = useState(false);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const profitMargin = useProfitMargin(formData.salePrice, formData.purchasePrice);

  // Fetch product data on mount
  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const product = await api.get<Product>(`/products/${productId}`);
        setFormData({
          productName: product.productName,
          sku: product.sku,
          category: product.category,
          productType: (product as any).productType || "goods",
          description: product.description || "",
          salePrice: product.salePrice.toString(),
          purchasePrice: product.purchasePrice?.toString() || "",
          taxType: (product as any).taxType || "exclusive",
          barcode: (product as any).barcode || "",
          unit: product.unit,
          gst: product.gst?.toString() || "0",
          status: product.status,
        });
        setError("");
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load product");
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [productId]);

  const handleChange = (fieldName: string, value: string | boolean) => {
    if (fieldName === "category" && typeof value === "string" && !skuChanged) {
      // Auto-generate SKU when category changes (but don't override if user manually changed it)
      generateSKU(value);
    }
    setFormData((prev) => ({ ...prev, [fieldName]: value }));
    if (fieldName === "sku") {
      setSkuChanged(true);
    }
    setError("");
  };

  // Auto-fill SKU when generated
  useEffect(() => {
    if (sku && !skuChanged) {
      setFormData((prev) => ({ ...prev, sku }));
    }
  }, [sku, skuChanged]);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setSubmitting(true);

    try {
      // Validation
      if (!formData.productName.trim()) {
        setError("Product name is required");
        setSubmitting(false);
        return;
      }
      if (!formData.sku.trim()) {
        setError("SKU is required");
        setSubmitting(false);
        return;
      }
      if (!formData.salePrice || parseFloat(formData.salePrice) < 0) {
        setError("Valid sale price is required");
        setSubmitting(false);
        return;
      }
      // Purchase price only required for goods
      if (formData.productType === "goods" && (!formData.purchasePrice || parseFloat(formData.purchasePrice) < 0)) {
        setError("Valid purchase price is required for goods");
        setSubmitting(false);
        return;
      }

      const payload: any = {
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

      const response = await api.put<{ message: string; product: unknown }>(`/products/${productId}`, payload);

      setSuccess(response.message);
      setTimeout(() => {
        router.push("/inventory/products");
      }, 1500);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update product");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="flex justify-center items-center h-64">
          <div className="text-gray-500">Loading product...</div>
        </div>
      </div>
    );
  }

  return (
    <FormWrapper
      title="Edit Product"
      onSubmit={handleSubmit}
      submitLabel="Update Product"
      error={error}
      success={success}
      isLoading={submitting || configLoading}
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
                    {skuLoading && <span className="text-blue-600 ml-2">Regenerating...</span>}
                  </label>
                  <input
                    id="sku"
                    type="text"
                    placeholder="SKU"
                    value={formData.sku}
                    onChange={(e) => handleChange("sku", e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  />
                  {skuError && <p className="mt-1 text-sm text-red-600">{skuError}</p>}
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
