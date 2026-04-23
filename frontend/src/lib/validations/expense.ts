import { z } from "zod";
import { ExpenseStatusEnum, PaymentModeEnum, ExpenseCategoryEnum } from "@/enums";

export const expenseValidationSchema = z.object({
  date: z.string().min(1, "Date is required"),
  amount: z.number().min(0.01, "Amount must be greater than 0"),
  category: z.enum(
    [
      ExpenseCategoryEnum.OFFICE_SUPPLIES,
      ExpenseCategoryEnum.TRAVEL,
      ExpenseCategoryEnum.UTILITIES,
      ExpenseCategoryEnum.RENT,
      ExpenseCategoryEnum.MEALS,
      ExpenseCategoryEnum.OTHER,
    ] as [string, ...string[]]
  ),
  paymentMode: z.enum(
    [
      PaymentModeEnum.CASH,
      PaymentModeEnum.BANK_TRANSFER,
      PaymentModeEnum.CREDIT_CARD,
      PaymentModeEnum.CHECK,
    ] as [string, ...string[]]
  ),
  vendor: z.string().optional().nullable(),
  referenceNo: z.string().optional().nullable(),
  description: z.string().optional().nullable(),
  status: z.enum(
    [ExpenseStatusEnum.PENDING, ExpenseStatusEnum.APPROVED, ExpenseStatusEnum.REJECTED] as [
      string,
      ...string[],
    ]
  ),
});

export type ExpenseFormData = z.infer<typeof expenseValidationSchema>;
