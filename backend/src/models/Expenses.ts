import mongoose from "mongoose";
import { CATEGORY, PAYMENT_METHOD, STATUS } from "../enum/expense.js";


const expenseSchema = new mongoose.Schema(
  {
    companyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Company",
      required: true,
      index: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    expenseDate: {
      type: Date,
      required: true,
    },

    amount: {
      type: Number,
      required: true,
      min: 0,
    },

    category: {
      type: String,
      required: true,
      enum: CATEGORY,
    },

    paymentMode: {
      type: String,
      required: true,
      enum: PAYMENT_METHOD,
    },

    vendor: {
      type: String,
      trim: true,
    },

    referenceNumber: {
      type: String,
      trim: true,
    },

    description: {
      type: String,
      trim: true,
    },

    status: {
      type: String,
      enum: STATUS,
      default: "Pending",
    },
  },
  { timestamps: true }
);

export const Expense = mongoose.model("Expense", expenseSchema);