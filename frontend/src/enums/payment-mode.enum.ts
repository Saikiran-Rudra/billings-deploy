export enum PaymentModeEnum {
  CASH = "Cash",
  BANK_TRANSFER = "Bank Transfer",
  UPI = "UPI",
  CREDIT_CARD = "Credit Card",
  CHECK = "Check",
}

export const PAYMENT_MODE_OPTIONS = [
  { value: PaymentModeEnum.CASH, label: "Cash" },
  { value: PaymentModeEnum.BANK_TRANSFER, label: "Bank Transfer" },
  { value: PaymentModeEnum.UPI, label: "UPI" },
  { value: PaymentModeEnum.CREDIT_CARD, label: "Credit Card" },
  { value: PaymentModeEnum.CHECK, label: "Check" },
];

export const CASH_BANK_PAYMENT_MODES = [
  { value: PaymentModeEnum.CASH, label: "Cash" },
  { value: PaymentModeEnum.BANK_TRANSFER, label: "Bank Transfer" },
  { value: PaymentModeEnum.UPI, label: "UPI" },
  { value: PaymentModeEnum.CREDIT_CARD, label: "Credit Card" },
];

export const EXPENSE_PAYMENT_MODES = [
  { value: PaymentModeEnum.CASH, label: "Cash" },
  { value: PaymentModeEnum.BANK_TRANSFER, label: "Bank Transfer" },
  { value: PaymentModeEnum.CREDIT_CARD, label: "Credit Card" },
  { value: PaymentModeEnum.CHECK, label: "Check" },
];
