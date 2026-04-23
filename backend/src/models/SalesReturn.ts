import mongoose, { Schema, Document } from "mongoose";

export interface ISalesReturn extends Document {
  companyId: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  returnId: string;
  date: string;
  originalInvoice: string;
  customer: string;
  items: string;
  amount: number;
  status: "pending" | "approved" | "rejected" | "completed";
  notes: string;
  createdAt: Date;
  updatedAt: Date;
}

const salesReturnSchema = new Schema<ISalesReturn>(
  {
    companyId: {
      type: Schema.Types.ObjectId,
      ref: "Company",
      required: true,
      index: true,
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    returnId: {
      type: String,
      required: [true, "Return ID is required"],
      trim: true,
    },
    date: {
      type: String,
      required: [true, "Date is required"],
      trim: true,
    },
    originalInvoice: {
      type: String,
      required: [true, "Original invoice reference is required"],
      trim: true,
    },
    customer: {
      type: String,
      required: [true, "Customer is required"],
      trim: true,
    },
    items: {
      type: String,
      required: [true, "Items description is required"],
      trim: true,
    },
    amount: {
      type: Number,
      required: [true, "Amount is required"],
      min: [0, "Amount cannot be negative"],
    },
    status: {
      type: String,
      enum: ["pending", "approved", "rejected", "completed"],
      default: "pending",
    },
    notes: {
      type: String,
      trim: true,
      default: "",
    },
  },
  { timestamps: true }
);

// Unique return ID per user
salesReturnSchema.index({ userId: 1, returnId: 1 }, { unique: true });
salesReturnSchema.index({ userId: 1, createdAt: -1 });

const SalesReturn = mongoose.model<ISalesReturn>(
  "SalesReturn",
  salesReturnSchema
);

export default SalesReturn;
