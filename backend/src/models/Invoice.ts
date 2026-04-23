import mongoose, { Schema, Document } from "mongoose";

export interface IInvoiceLineItem {
  itemName: string;
  description: string;
  quantity: number;
  rate: number;
  amount: number;
}

export interface IInvoice extends Document {
  companyId: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  invoiceNumber: string;
  invoiceDate: string;
  dueDate: string;
  customerId?: mongoose.Types.ObjectId;
  customerName: string;
  lineItems: IInvoiceLineItem[];
  subtotal: number;
  discountType: "flat" | "percent";
  discountValue: number;
  taxPercent: number;
  taxAmount: number;
  total: number;
  notes: string;
  terms: string;
  status: "draft" | "sent" | "partially_paid" | "paid" | "overdue";
  createdAt: Date;
  updatedAt: Date;
}

const invoiceLineItemSchema = new Schema<IInvoiceLineItem>(
  {
    itemName: { type: String, required: true, trim: true },
    description: { type: String, trim: true, default: "" },
    quantity: { type: Number, required: true, min: 0.01 },
    rate: { type: Number, required: true, min: 0 },
    amount: { type: Number, required: true, min: 0 },
  },
  { _id: false }
);

const invoiceSchema = new Schema<IInvoice>(
  {
    companyId: { 
      type: Schema.Types.ObjectId, 
      ref: "Company", 
      required: true, 
      index: true 
    },
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    invoiceNumber: { type: String, required: true, trim: true },
    invoiceDate: { type: String, required: true, trim: true },
    dueDate: { type: String, required: true, trim: true },
    customerId: { type: Schema.Types.ObjectId, ref: "Customer", required: false },
    customerName: { type: String, required: true, trim: true },
    lineItems: { type: [invoiceLineItemSchema], required: true, default: [] },
    subtotal: { type: Number, required: true, min: 0 },
    discountType: { type: String, enum: ["flat", "percent"], default: "flat" },
    discountValue: { type: Number, min: 0, default: 0 },
    taxPercent: { type: Number, min: 0, default: 0 },
    taxAmount: { type: Number, min: 0, default: 0 },
    total: { type: Number, required: true, min: 0 },
    notes: { type: String, trim: true, default: "" },
    terms: { type: String, trim: true, default: "" },
    status: {
      type: String,
      enum: ["draft", "sent", "partially_paid", "paid", "overdue"],
      default: "draft",
    },
  },
  { timestamps: true }
);

invoiceSchema.index({ companyId: 1, userId: 1, invoiceNumber: 1 }, { unique: true });
invoiceSchema.index({ companyId: 1, createdAt: -1 });

const Invoice = mongoose.model<IInvoice>("Invoice", invoiceSchema);

export default Invoice;
