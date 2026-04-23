export enum ExpenseStatusEnum {
  PENDING = "pending",
  APPROVED = "approved",
  REJECTED = "rejected",
}

export const EXPENSE_STATUS_OPTIONS = [
  { value: ExpenseStatusEnum.PENDING, label: "Pending" },
  { value: ExpenseStatusEnum.APPROVED, label: "Approved" },
  { value: ExpenseStatusEnum.REJECTED, label: "Rejected" },
];
