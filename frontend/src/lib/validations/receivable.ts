import { z } from "zod";
import { ReceivableStatusEnum } from "@/enums";

export const receivableValidationSchema = z.object({
  invoiceNo: z.string().min(1, "Invoice number is required"),
  customer: z.string().min(1, "Customer name is required"),
  customerNumber: z.number().min(1, "Customer number is required"),
  amount: z.number().min(0.01, "Amount must be greater than 0"),
  dueDate: z.string().optional().nullable(),
  status: z.enum(
    [ReceivableStatusEnum.ACTIVE, ReceivableStatusEnum.PAID, ReceivableStatusEnum.OVERDUE] as [
      string,
      ...string[],
    ]
  ),
});

export type ReceivableFormData = z.infer<typeof receivableValidationSchema>;
