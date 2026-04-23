import mongoose, { Schema, Document } from "mongoose";

interface IAddress {
  street: string;
  city: string;
  state: string;
  country?: string;
  pincode: string;
}

export interface ISupplier extends Document {
  companyId: mongoose.Types.ObjectId;
  supplierName: string;
  companyName: string;
  email: string;
  phone: string;
  isGSTRegistered: boolean;
  gstNumber?: string;
  billingAddress: IAddress;
  shippingAddress: IAddress;
  paymentTerms: string;
  openingBalance?: number;
  notes?: string;
  status: "active" | "inactive";
  isDeleted: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const AddressSchema = new Schema({
  street: {
    type: String,
    required: true,
  },
  city: {
    type: String,
    required: true,
  },
  state: {
    type: String,
    required: true,
  },
  country: {
    type: String,
    default: "India",
  },
  pincode: {
    type: String,
    required: true,
    match: /^\d{6}$/,
  },
});

const SupplierSchema = new Schema<ISupplier>(
  {
    companyId: {
      type: Schema.Types.ObjectId,
      ref: "Company",
      required: true,
    },
    supplierName: {
      type: String,
      required: true,
      trim: true,
    },
    companyName: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
      match: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    },
    phone: {
      type: String,
      required: true,
      trim: true,
    },
    isGSTRegistered: {
      type: Boolean,
      default: false,
    },
    gstNumber: {
      type: String,
      trim: true,
      uppercase: true,
      match: /^[0-9A-Z]{15}$/,
      required: function (this: ISupplier) {
        return this.isGSTRegistered;
      },
    },
    billingAddress: {
      type: AddressSchema,
      required: true,
    },
    shippingAddress: {
      type: AddressSchema,
      required: true,
    },
    paymentTerms: {
      type: String,
      required: true,
      trim: true,
    },
    openingBalance: {
      type: Number,
      default: 0,
    },
    notes: {
      type: String,
      trim: true,
      default: "",
    },
    status: {
      type: String,
      enum: ["active", "inactive"],
      default: "active",
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

// Compound index for unique email per company
SupplierSchema.index({ companyId: 1, email: 1 }, { unique: true, sparse: true });

// Index for soft delete
SupplierSchema.index({ companyId: 1, isDeleted: 1 });

export const Supplier = mongoose.model<ISupplier>("Supplier", SupplierSchema);
