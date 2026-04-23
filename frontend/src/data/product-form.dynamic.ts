/**
 * Dynamic Product Form Configuration
 * Generates form config with options from the product config API
 */

import type { FormOption } from "@/hooks/useProductOptions";

export interface FormFieldConfig {
  name: string;
  label: string;
  type: string;
  placeholder: string;
  required: boolean;
  gridSpan: string;
  options?: FormOption[];
}

export function getProductFormConfig(
  categoryOptions: FormOption[],
  unitOptions: FormOption[],
  gstOptions: FormOption[]
): FormFieldConfig[] {
  return [
    {
      name: "productName",
      label: "Product Name",
      type: "text",
      placeholder: "Enter product name",
      required: true,
      gridSpan: "md:col-span-4",
    },
    {
      name: "sku",
      label: "SKU",
      type: "text",
      placeholder: "Enter SKU",
      required: true,
      gridSpan: "md:col-span-4",
    },
    {
      name: "category",
      label: "Category",
      type: "select",
      placeholder: "Select Category",
      required: true,
      gridSpan: "md:col-span-4",
      options: categoryOptions.length > 0 ? categoryOptions : [{ value: "", label: "No categories available" }],
    },
    {
      name: "salePrice",
      label: "Sale Price (₹)",
      type: "number",
      placeholder: "0.00",
      required: true,
      gridSpan: "md:col-span-3",
    },
    {
      name: "purchasePrice",
      label: "Purchase Price (₹)",
      type: "number",
      placeholder: "0.00",
      required: false,
      gridSpan: "md:col-span-3",
    },
    {
      name: "unit",
      label: "Unit",
      type: "select",
      placeholder: "Select Unit",
      required: true,
      gridSpan: "md:col-span-3",
      options: unitOptions.length > 0 ? unitOptions : [{ value: "", label: "No units available" }],
    },
    {
      name: "gst",
      label: "GST Rate (%)",
      type: "select",
      placeholder: "Select GST Rate",
      required: false,
      gridSpan: "md:col-span-3",
      options: gstOptions.length > 0 ? gstOptions : [{ value: "0", label: "0%" }],
    },
    {
      name: "status",
      label: "Status",
      type: "select",
      placeholder: "Select Status",
      required: true,
      gridSpan: "md:col-span-3",
      options: [
        { value: "active", label: "Active" },
        { value: "inactive", label: "Inactive" },
      ],
    },
    {
      name: "description",
      label: "Description",
      type: "textarea",
      placeholder: "Enter product description",
      required: false,
      gridSpan: "md:col-span-12",
    },
  ];
}
