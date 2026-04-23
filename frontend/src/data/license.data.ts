// data/license.data.ts

export const licenseFormConfig = [
  { name: "name", label: "Plan Name", type: "text", required: true },
  { name: "price", label: "Price", type: "number", min: 0 },
  { name: "durationInDays", label: "Duration (Days)", type: "number", min: 1 },
  { name: "userLimit", label: "User Limit", type: "number", min: 1 },
];

export const licenseFeatureConfig = [
  { name: "companies", label: "Companies" },
  { name: "supplier", label: "Supplier" },
  { name: "purchase", label: "Purchase" },
  { name: "reports", label: "Reports" },
  { name: "apiAccess", label: "API Access" },
];