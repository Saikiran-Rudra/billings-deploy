export enum ReceivableStatusEnum {
  ACTIVE = "active",
  PAID = "paid",
  OVERDUE = "overdue",
}

export const RECEIVABLE_STATUS_OPTIONS = [
  { value: ReceivableStatusEnum.ACTIVE, label: "Active" },
  { value: ReceivableStatusEnum.PAID, label: "Paid" },
  { value: ReceivableStatusEnum.OVERDUE, label: "Overdue" },
];
