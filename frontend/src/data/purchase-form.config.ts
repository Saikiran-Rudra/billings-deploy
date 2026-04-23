import { PurchaseFormData, PurchaseItemFormData } from "@/lib/validations/purchase";

export interface FormOption {
  value: string | number;
  label: string;
}

export interface FormFieldConfig {
  name: keyof PurchaseFormData | string;
  label: string;
  type: "text" | "email" | "phone" | "number" | "select" | "textarea" | "toggle";
  placeholder?: string;
  required?: boolean;
  gridSpan?: string;
  readonly?: boolean;
  defaultValue?: string | number | boolean;
  options?: FormOption[] | ((data: Partial<PurchaseFormData>) => FormOption[]);
  showIf?: (data: Partial<PurchaseFormData>) => boolean;
  help?: string;
  min?: string | number;
  max?: string | number;
  step?: string | number;
}

export interface PurchaseFormState {
  supplierId: string;
  items: PurchaseItemFormData[];
  notes?: string;
  status?: "draft" | "confirmed" | "cancelled";
}

/**
 * INDIA STATE LIST
 * Used for dropdown selections
 */
export const INDIAN_STATES = [
  { value: "Andhra Pradesh", label: "Andhra Pradesh" },
  { value: "Arunachal Pradesh", label: "Arunachal Pradesh" },
  { value: "Assam", label: "Assam" },
  { value: "Bihar", label: "Bihar" },
  { value: "Chhattisgarh", label: "Chhattisgarh" },
  { value: "Goa", label: "Goa" },
  { value: "Gujarat", label: "Gujarat" },
  { value: "Haryana", label: "Haryana" },
  { value: "Himachal Pradesh", label: "Himachal Pradesh" },
  { value: "Jharkhand", label: "Jharkhand" },
  { value: "Karnataka", label: "Karnataka" },
  { value: "Kerala", label: "Kerala" },
  { value: "Madhya Pradesh", label: "Madhya Pradesh" },
  { value: "Maharashtra", label: "Maharashtra" },
  { value: "Manipur", label: "Manipur" },
  { value: "Meghalaya", label: "Meghalaya" },
  { value: "Mizoram", label: "Mizoram" },
  { value: "Nagaland", label: "Nagaland" },
  { value: "Odisha", label: "Odisha" },
  { value: "Punjab", label: "Punjab" },
  { value: "Rajasthan", label: "Rajasthan" },
  { value: "Sikkim", label: "Sikkim" },
  { value: "Tamil Nadu", label: "Tamil Nadu" },
  { value: "Telangana", label: "Telangana" },
  { value: "Tripura", label: "Tripura" },
  { value: "Uttar Pradesh", label: "Uttar Pradesh" },
  { value: "Uttarakhand", label: "Uttarakhand" },
  { value: "West Bengal", label: "West Bengal" },
];

/**
 * TAX RATES FOR PRODUCTS
 * Common GST rates in India
 */
export const TAX_RATES = [
  { value: 0, label: "0%" },
  { value: 5, label: "5%" },
  { value: 12, label: "12%" },
  { value: 18, label: "18%" },
  { value: 28, label: "28%" },
];

/**
 * Purchase Form Field Configuration
 */
export function getPurchaseFormConfig(): FormFieldConfig[] {
  return [
    // ========== SECTION 1: VENDOR SELECTION ==========
    {
      name: "supplierId",
      label: "Vendor Name",
      type: "select",
      placeholder: "Search and select vendor...",
      required: true,
      gridSpan: "md:col-span-12",
      help: "Select a vendor/supplier for this purchase",
    },

    // ========== SECTION 2: NOTES ==========
    {
      name: "notes",
      label: "Notes",
      type: "textarea",
      placeholder: "Add any additional notes or special instructions",
      required: false,
      gridSpan: "md:col-span-12",
      help: "Optional notes for internal use",
    },
  ];
}

/**
 * Initial values for purchase form
 */
export function getPurchaseInitialValues(): Partial<PurchaseFormData> {
  return {
    supplierId: "",
    items: [],
    notes: "",
    status: "draft",
  };
}

/**
 * Get visible fields based on form state
 */
export function getVisiblePurchaseFields(
  formConfig: FormFieldConfig[],
  formData: Partial<PurchaseFormData>
): FormFieldConfig[] {
  return formConfig.filter((field) => {
    if (field.showIf) {
      return field.showIf(formData);
    }
    return true;
  });
}

/**
 * Purchase Table Columns Configuration
 */
export const purchaseTableColumns = [
  { key: "purchaseNumber", header: "Purchase #" },
  {
    key: "supplierSnapshot.supplierName",
    header: "Vendor",
    accessor: (row: any) => row.supplierSnapshot?.supplierName || "-",
  },
  {
    key: "items",
    header: "Items",
    accessor: (row: any) => `${row.items?.length || 0} items`,
  },
  { key: "subtotal", header: "Subtotal", accessor: (row: any) => `₹${row.subtotal?.toFixed(2) || "0.00"}` },
  { key: "totalGST", header: "GST", accessor: (row: any) => `₹${row.totalGST?.toFixed(2) || "0.00"}` },
  { key: "grandTotal", header: "Total", accessor: (row: any) => `₹${row.grandTotal?.toFixed(2) || "0.00"}` },
  {
    key: "taxType",
    header: "Tax Type",
    accessor: (row: any) => {
      const type = row.taxType;
      const typeMap: Record<string, string> = {
        intra: "Intra-State",
        inter: "Inter-State",
        zero: "Zero-Rated",
        none: "No GST",
      };
      return typeMap[type] || type;
    },
  },
  { key: "status", header: "Status" },
  { key: "createdAt", header: "Date", accessor: (row: any) => new Date(row.createdAt).toLocaleDateString() },
];

/**
 * Format tax type for display
 */
export const formatTaxType = (taxType: string): string => {
  const typeMap: Record<string, string> = {
    intra: "Intra-State (CGST + SGST)",
    inter: "Inter-State (IGST)",
    zero: "Zero-Rated",
    none: "No GST",
  };
  return typeMap[taxType] || taxType;
};

/**
 * Format currency
 */
export const formatCurrency = (value: number): string => {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
  }).format(value);
};
