import mongoose, { Schema, Document } from "mongoose";

export interface IPayment extends Document {
  companyId: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  date: string;
  invoice: string;
  customer: string;
  Amount: number;
  paymentmode: "Cash" | "Bank Transfer" | "Credit Card" | "UPI";
  reference: string;
  notes: string;
  createdAt: Date;
  updatedAt: Date;
}

const paymentSchema = new Schema<IPayment>(
  {
    companyId: { type: Schema.Types.ObjectId, ref: "Company", required: true, index: true },
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    date: { type: String, required: [true, "Payment date is required"], trim: true },
    invoice: { type: String, required: [true, "Invoice is required"], trim: true },
    customer: { type: String, required: [true, "Customer is required"], trim: true },
    Amount: { type: Number, required: [true, "Amount is required"], min: [0.01, "Amount must be greater than 0"] },
    paymentmode: {
      type: String,
      enum: ["Cash", "Bank Transfer", "Credit Card", "UPI"],
      required: [true, "Payment mode is required"],
    },
    reference: { type: String, trim: true, default: "" },
    notes: { type: String, trim: true, default: "" },
  },
  { timestamps: true }
);

const Payment = mongoose.model<IPayment>("Payment", paymentSchema);

export default Payment;
