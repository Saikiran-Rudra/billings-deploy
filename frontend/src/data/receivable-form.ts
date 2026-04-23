import { RECEIVABLE_STATUS_OPTIONS } from "@/enums";

export const receivableFormConfig = [
  {
    name: "invoiceNo",
    label: "Invoice No",
    type: "text",
    placeholder: "Enter invoice number",
    required: true,
    gridSpan: "md:col-span-6",
  },
  {
    name: "customer",
    label: "Customer",
    type: "text",
    placeholder: "Enter customer name",
    required: true,
    gridSpan: "md:col-span-6",
  },
  {
    name: "customerNumber",
    label: "Customer Number",
    type: "number",
    placeholder: "Enter customer number",
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
    name: "dueDate",
    label: "Due Date",
    type: "date",
    placeholder: "",
    required: false,
    gridSpan: "md:col-span-6",
  },
  {
    name: "status",
    label: "Status",
    type: "select",
    placeholder: "Select status",
    required: true,
    gridSpan: "md:col-span-6",
    options: RECEIVABLE_STATUS_OPTIONS,
  },
];