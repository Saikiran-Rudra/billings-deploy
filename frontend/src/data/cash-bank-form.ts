import { CASH_BANK_PAYMENT_MODES, TRANSACTION_TYPE_OPTIONS } from "@/enums";

export const cashBankFormConfig = [
  {
    name: "date",
    label: "Date",
    type: "date",
    placeholder: "",
    required: true,
    gridSpan: "md:col-span-6",
  },
  {
    name: "amount",
    label: "Amount",
    type: "number",
    placeholder: "0.00",
    required: true,
    gridSpan: "md:col-span-6",
  },
  {
    name: "mode",
    label: "Mode",
    type: "select",
    placeholder: "Select payment mode",
    required: true,
    gridSpan: "md:col-span-6",
    options: CASH_BANK_PAYMENT_MODES,
  },
  {
    name: "type",
    label: "Type",
    type: "select",
    placeholder: "Select transaction type",
    required: true,
    gridSpan: "md:col-span-6",
    options: TRANSACTION_TYPE_OPTIONS,
  },
  {
    name: "description",
    label: "Description",
    type: "textarea",
    placeholder: "Enter description...",
    required: false,
    gridSpan: "md:col-span-12",
  },
];
