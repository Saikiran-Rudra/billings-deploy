export const COMPANY_STATUS = {
  ACTIVE: "active",
  INACTIVE: "inactive",
} as const;

export const COMPANY_STATUS_VALUES = Object.values(COMPANY_STATUS) as [
  (typeof COMPANY_STATUS)[keyof typeof COMPANY_STATUS],
  ...(typeof COMPANY_STATUS)[keyof typeof COMPANY_STATUS][],
];

export const GST_STATUS = {
  YES: "YES",
  NO: "NO",
} as const;

export type GstStatusValue = (typeof GST_STATUS)[keyof typeof GST_STATUS];

export const GST_STATUS_VALUES = Object.values(GST_STATUS) as [
  GstStatusValue,
  ...GstStatusValue[],
];

export const BUSINESS_TYPES = [
  "proprietorship",
  "partnership",
  "llp",
  "private limited",
  "publiclimited",
  "trust",
  "ngo",
  "other",
] as const;

export const INDUSTRIES = [
  "retail",
  "manufacturing",
  "services",
  "technology",
  "healthcare",
  "education",
  "construction",
  "food_beverage",
  "logistics",
  "other",
] as const;
