import {
  CompanyFormData,
} from "@/lib/validations/company";
import {
  BUSINESS_TYPES as BUSINESS_TYPE_LABELS,
  INDUSTRIES as INDUSTRY_LABELS,
} from "@/constants/indian-banks";

export interface FormOption {
  value: string | number;
  label: string;
}

export interface FormFieldConfig {
  name: keyof CompanyFormData | string;
  label: string;
  type: "text" | "email" | "phone" | "number" | "select" | "textarea" | "toggle";
  placeholder?: string;
  required?: boolean;
  gridSpan?: string;
  readonly?: boolean;
  defaultValue?: string | number | boolean;
  options?: FormOption[];
  help?: string;
}

const BUSINESS_TYPE_VALUE_MAP: Record<string, string> = {
  "Sole Proprietorship": "proprietorship",
  Partnership: "partnership",
  LLP: "llp",
  "Private Limited": "private_limited",
  "Public Limited": "public_limited",
  Trust: "trust",
  Society: "other",
  NGO: "ngo",
};

const INDUSTRY_VALUE_MAP: Record<string, string> = {
  Retail: "retail",
  Manufacturing: "manufacturing",
  Services: "services",
  IT: "technology",
  Healthcare: "healthcare",
  Education: "education",
  Finance: "other",
  "Real Estate": "other",
  Construction: "construction",
  Agriculture: "other",
  Hospitality: "other",
  "Food & Beverage": "food_beverage",
  Automotive: "other",
  Logistics: "logistics",
  Telecom: "other",
  Media: "other",
  Consultancy: "other",
  Other: "other",
};

export const BUSINESS_TYPE_OPTIONS: FormOption[] = BUSINESS_TYPE_LABELS.map((option) => ({
  value: BUSINESS_TYPE_VALUE_MAP[option.value] || "other",
  label: option.label,
}));

export const INDUSTRY_OPTIONS: FormOption[] = INDUSTRY_LABELS.map((option) => ({
  value: INDUSTRY_VALUE_MAP[option.value] || "other",
  label: option.label,
}));

/**
 * Company Form Field Configuration
 */
export function getCompanyFormConfig(): FormFieldConfig[] {
  return [
    // ========== SECTION 1: BASIC DETAILS ==========
    {
      name: "name",
      label: "Company Name",
      type: "text",
      placeholder: "Enter company name",
      required: true,
      gridSpan: "col-span-2",
      help: "The official name of the company",
    },
    {
      name: "businessType",
      label: "Business Type",
      type: "select",
      required: true,
      options: BUSINESS_TYPE_OPTIONS,
      gridSpan: "col-span-1",
    },
    {
      name: "industry",
      label: "Industry",
      type: "select",
      required: true,
      options: INDUSTRY_OPTIONS,
      gridSpan: "col-span-1",
    },
    {
      name: "address",
      label: "Business Address",
      type: "textarea",
      required: true,
      gridSpan: "col-span-2",
    },
    {
      name: "financialYearStart",
      label: "Financial Year Start",
      type: "text",
      required: true,
      gridSpan: "col-span-1",
    },
  ];
}
