export enum TransactionTypeEnum {
  INCOME = "Income",
  EXPENSE = "Expense",
}

export const TRANSACTION_TYPE_OPTIONS = [
  { value: TransactionTypeEnum.INCOME, label: "Income" },
  { value: TransactionTypeEnum.EXPENSE, label: "Expense" },
];
