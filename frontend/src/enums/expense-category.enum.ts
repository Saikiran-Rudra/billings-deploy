export enum ExpenseCategoryEnum {
  OFFICE_SUPPLIES = "Office Supplies",
  TRAVEL = "Travel",
  UTILITIES = "Utilities",
  RENT = "Rent",
  MEALS = "Meals",
  OTHER = "Other",
}

export const EXPENSE_CATEGORY_OPTIONS = [
  { value: ExpenseCategoryEnum.OFFICE_SUPPLIES, label: "Office Supplies" },
  { value: ExpenseCategoryEnum.TRAVEL, label: "Travel" },
  { value: ExpenseCategoryEnum.UTILITIES, label: "Utilities" },
  { value: ExpenseCategoryEnum.RENT, label: "Rent" },
  { value: ExpenseCategoryEnum.MEALS, label: "Meals" },
  { value: ExpenseCategoryEnum.OTHER, label: "Other" },
];
