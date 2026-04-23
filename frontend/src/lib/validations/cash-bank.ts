import { z } from "zod";
import { PaymentModeEnum, TransactionTypeEnum } from "@/enums";

export const cashBankValidationSchema = z.object({
  date: z.string().min(1, "Date is required"),
  amount: z.number().min(0.01, "Amount must be greater than 0"),
  mode: z.enum(
    [
      PaymentModeEnum.CASH,
      PaymentModeEnum.BANK_TRANSFER,
      PaymentModeEnum.UPI,
      PaymentModeEnum.CREDIT_CARD,
    ] as [string, ...string[]]
  ),
  type: z.enum(
    [TransactionTypeEnum.INCOME, TransactionTypeEnum.EXPENSE] as [string, ...string[]]
  ),
  description: z.string().optional().nullable(),
});

export type CashBankFormData = z.infer<typeof cashBankValidationSchema>;
