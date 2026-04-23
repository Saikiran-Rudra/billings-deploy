import { SupplierFormData } from "@/lib/validations/supplier";

export interface FormOption {
  value: string | number;
  label: string;
  days?: number; // For payment terms
}

export interface FormFieldConfig {
  name: keyof SupplierFormData | string;
  label: string;
  type: "text" | "email" | "phone" | "number" | "select" | "textarea" | "toggle";
  placeholder?: string;
  required?: boolean;
  gridSpan?: string;
  readonly?: boolean;
  defaultValue?: string | number | boolean;
  options?: FormOption[] | ((data: Partial<SupplierFormData>) => FormOption[]);
  showIf?: (data: Partial<SupplierFormData>) => boolean;
  help?: string;
  min?: string | number;
  max?: string | number;
  step?: string | number;
}

/**
 * INDIA STATE-CITY MAPPING
 * Maps states to their major cities for dependent dropdown
 */
export const STATE_CITY_MAP: Record<string, string[]> = {
  // North India
  "Andhra Pradesh": ["Visakhapatnam", "Vijayawada", "Tirupati"],
  "Arunachal Pradesh": ["Itanagar", "Naharlagun", "Pasighat"],
  Assam: ["Guwahati", "Silchar", "Dibrugarh"],
  Bihar: ["Patna", "Gaya", "Bhagalpur"],
  Chhattisgarh: ["Raipur", "Bilaspur", "Durg"],
  Goa: ["Panaji", "Margao", "Vasco da Gama"],
  Gujarat: ["Ahmedabad", "Surat", "Vadodara", "Rajkot", "Bhavnagar"],
  Haryana: ["Faridabad", "Gurgaon", "Hisar", "Rohtak"],
  "Himachal Pradesh": ["Shimla", "Solan", "Mandi"],
  Jharkhand: ["Ranchi", "Jamshedpur", "Dhanbad"],
  Karnataka: ["Bangalore", "Mysore", "Hubli", "Belagavi", "Kochi"],
  Kerala: ["Kochi", "Thiruvananthapuram", "Kozhikode", "Ernakulam"],
  "Madhya Pradesh": ["Indore", "Bhopal", "Jabalpur", "Ujjain"],
  Maharashtra: ["Mumbai", "Pune", "Nagpur", "Nashik", "Aurangabad"],
  Manipur: ["Imphal", "Bishnupur"],
  Meghalaya: ["Shillong", "Tura"],
  Mizoram: ["Aizawl", "Lunglei"],
  Nagaland: ["Kohima", "Dimapur"],
  Odisha: ["Bhubaneswar", "Cuttack", "Rourkela"],
  Punjab: ["Chandigarh", "Ludhiana", "Amritsar", "Jalandhar"],
  Rajasthan: ["Jaipur", "Jodhpur", "Udaipur", "Kota", "Ajmer"],
  Sikkim: ["Gangtok", "Siliguri"],
  "Tamil Nadu": ["Chennai", "Coimbatore", "Madurai", "Salem"],
  Telangana: ["Hyderabad", "Warangal", "Nizamabad"],
  Tripura: ["Agartala", "Udaipur"],
  "Uttar Pradesh": [
    "Lucknow",
    "Kanpur",
    "Varanasi",
    "Agra",
    "Meerut",
    "Ghaziabad",
  ],
  Uttarakhand: ["Dehradun", "Haridwar", "Nainital"],
  "West Bengal": ["Kolkata", "Howrah", "Asansol", "Darjeeling"],
};

/**
 * INDIAN STATES LIST
 * Derived from STATE_CITY_MAP for form options
 */
export const INDIAN_STATES = Object.keys(STATE_CITY_MAP).map((state) => ({
  value: state,
  label: state,
}));

/**
 * PAYMENT TERMS CONFIGURATION
 * Includes label, value, and days for potential due date calculation
 */
export const PAYMENT_TERMS: FormOption[] = [
  { label: "Due on Receipt", value: "due_on_receipt", days: 0 },
  { label: "Net 7 Days", value: "net_7", days: 7 },
  { label: "Net 15 Days", value: "net_15", days: 15 },
  { label: "Net 30 Days", value: "net_30", days: 30 },
  { label: "Net 45 Days", value: "net_45", days: 45 },
  { label: "Net 60 Days", value: "net_60", days: 60 },
  { label: "End of Month", value: "eom", days: 0 },
];

/**
 * Supplier Form Field Configuration
 * Uses showIf() for conditional rendering based on form state
 * Supports dynamic options and dependent fields
 */
export function getSupplierFormConfig(): FormFieldConfig[] {
  return [
    // ========== SECTION 1: BASIC DETAILS ==========
    {
      name: "supplierName",
      label: "Supplier Name",
      type: "text",
      placeholder: "Enter supplier/vendor name",
      required: true,
      gridSpan: "md:col-span-6",
      help: "Individual supplier or vendor name",
    },

    {
      name: "companyName",
      label: "Company Name",
      type: "text",
      placeholder: "Enter company name",
      required: true,
      gridSpan: "md:col-span-6",
      help: "Legal company name",
    },

    {
      name: "email",
      label: "Email Address",
      type: "email",
      placeholder: "supplier@company.com",
      required: true,
      gridSpan: "md:col-span-6",
      help: "Primary contact email",
    },

    {
      name: "phone",
      label: "Phone Number",
      type: "phone",
      placeholder: "+91 XXXXX XXXXX",
      required: true,
      gridSpan: "md:col-span-6",
      help: "Contact phone number",
    },

    // ========== SECTION 2: GST INFO ==========
    {
      name: "isGSTRegistered",
      label: "GST Registered",
      type: "toggle",
      required: false,
      gridSpan: "md:col-span-12",
      help: "Is this supplier registered for GST?",
    },

    {
      name: "gstNumber",
      label: "GST Number",
      type: "text",
      placeholder: "XXXXXXXXXXXXXXX (15 characters)",
      required: true,
      gridSpan: "md:col-span-6",
      showIf: (data) => data.isGSTRegistered === true,
      help: "15-character GSTIN",
    },

    // ========== SECTION 3: BILLING ADDRESS ==========
    {
      name: "billingAddress.street",
      label: "Billing Street Address",
      type: "text",
      placeholder: "Enter street address",
      required: true,
      gridSpan: "md:col-span-12",
      help: "Building/Street address",
    },

    {
      name: "billingAddress.country",
      label: "Billing Country",
      type: "select",
      required: true,
      gridSpan: "md:col-span-6",
      readonly: true,
      defaultValue: "India",
      options: [{ value: "India", label: "India" }],
      help: "Fixed to India",
    },

    {
      name: "billingAddress.state",
      label: "Billing State",
      type: "select",
      placeholder: "Select a state",
      required: true,
      gridSpan: "md:col-span-6",
      options: INDIAN_STATES,
      help: "Select Indian state",
    },

    {
      name: "billingAddress.city",
      label: "Billing City",
      type: "text",
      placeholder: "Enter city",
      required: true,
      gridSpan: "md:col-span-6",
      help: "City name",
    },

    {
      name: "billingAddress.pincode",
      label: "Billing Pincode",
      type: "text",
      placeholder: "6-digit pincode",
      required: true,
      gridSpan: "md:col-span-6",
      help: "Must be 6 digits",
    },

    // ========== SECTION 4: SHIPPING ADDRESS ==========
    {
      name: "shippingAddress.street",
      label: "Shipping Street Address",
      type: "text",
      placeholder: "Enter street address",
      required: true,
      gridSpan: "md:col-span-12",
      help: "Building/Street address",
    },

    {
      name: "shippingAddress.country",
      label: "Shipping Country",
      type: "select",
      required: true,
      gridSpan: "md:col-span-6",
      readonly: true,
      defaultValue: "India",
      options: [{ value: "India", label: "India" }],
      help: "Fixed to India",
    },

    {
      name: "shippingAddress.state",
      label: "Shipping State",
      type: "select",
      placeholder: "Select a state",
      required: true,
      gridSpan: "md:col-span-6",
      options: INDIAN_STATES,
      help: "Select Indian state",
    },

    {
      name: "shippingAddress.city",
      label: "Shipping City",
      type: "text",
      placeholder: "Enter city",
      required: true,
      gridSpan: "md:col-span-6",
      help: "City name",
    },

    {
      name: "shippingAddress.pincode",
      label: "Shipping Pincode",
      type: "text",
      placeholder: "6-digit pincode",
      required: true,
      gridSpan: "md:col-span-6",
      help: "Must be 6 digits",
    },

    // ========== SECTION 5: BUSINESS INFO ==========
    {
      name: "paymentTerms",
      label: "Payment Terms",
      type: "select",
      placeholder: "Select payment terms",
      required: true,
      gridSpan: "md:col-span-6",
      options: PAYMENT_TERMS,
      help: "Payment terms agreed with supplier",
    },

    {
      name: "openingBalance",
      label: "Opening Balance (₹)",
      type: "number",
      placeholder: "0.00",
      required: false,
      gridSpan: "md:col-span-6",
      min: 0,
      step: 0.01,
      help: "Outstanding balance from previous period (positive values only)",
    },

    {
      name: "notes",
      label: "Additional Notes",
      type: "textarea",
      placeholder: "Enter any additional notes (optional)",
      required: false,
      gridSpan: "md:col-span-12",
      help: "Special instructions or notes",
    },

    {
      name: "status",
      label: "Status",
      type: "select",
      required: false,
      gridSpan: "md:col-span-6",
      options: [
        { value: "active", label: "Active" },
        { value: "inactive", label: "Inactive" },
      ],
      help: "Supplier status",
    },
  ];
}

/**
 * Get initial values for supplier form
 */
export function getSupplierInitialValues(): Partial<SupplierFormData> {
  return {
    supplierName: "",
    companyName: "",
    email: "",
    phone: "",
    isGSTRegistered: false,
    gstNumber: "",
    billingAddress: {
      street: "",
      city: "",
      state: "",
      country: "India",
      pincode: "",
    },
    shippingAddress: {
      street: "",
      city: "",
      state: "",
      country: "India",
      pincode: "",
    },
    paymentTerms: "",
    openingBalance: undefined,
    notes: "",
    status: "active",
  };
}

/**
 * Format payment terms value to readable label
 * Converts "due_on_receipt" to "Due on Receipt", etc.
 */
export function formatPaymentTerms(value: string): string {
  const paymentTermsMap: Record<string, string> = {
    due_on_receipt: "Due on Receipt",
    net_7: "Net 7 Days",
    net_15: "Net 15 Days",
    net_30: "Net 30 Days",
    net_45: "Net 45 Days",
    net_60: "Net 60 Days",
    eom: "End of Month",
  };
  return paymentTermsMap[value] || value;
}

/**
 * Filter fields based on showIf conditions
 */
export function getVisibleSupplierFields(
  config: FormFieldConfig[],
  formData: Partial<SupplierFormData>
): FormFieldConfig[] {
  return config.filter((field) => {
    if (!field.showIf) return true;
    return field.showIf(formData);
  });
}

/**
 * Table columns configuration for supplier list
 */
export const supplierTableColumns = [
  { key: "supplierName", header: "Supplier Name" },
  { key: "companyName", header: "Company Name" },
  { key: "email", header: "Email" },
  { key: "phone", header: "Phone" },
  { key: "gstNumber", header: "GST Number" },
  { key: "state", header: "State", accessor: (row: any) => row.billingAddress?.state || "-" },
  { key: "status", header: "Status" },
];
