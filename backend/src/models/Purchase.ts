import mongoose, { Schema, Document } from "mongoose";

export interface IAddress {
  street: string;
  city: string;
  state: string;
  country?: string;
  pincode: string;
}

export interface ISupplierSnapshot {
  supplierId: mongoose.Types.ObjectId;
  supplierName: string;
  companyName: string;
  phone: string;
  email: string;
  address: IAddress;
  gstNumber?: string;
  state: string;
  isGSTRegistered: boolean;
}

export interface IPurchaseItem {
  productId: mongoose.Types.ObjectId;
  productName: string;
  quantity: number;
  purchasePrice: number;
  taxRate: number;
  taxableAmount: number;
  cgst: number;
  sgst: number;
  igst: number;
  totalAmount: number;
  unit: string;
}

export interface IPurchase extends Document {
  companyId: mongoose.Types.ObjectId;
  supplierId: mongoose.Types.ObjectId;
  purchaseNumber: string;
  supplierSnapshot: ISupplierSnapshot;
  taxType: "intra" | "inter" | "zero" | "none";
  items: IPurchaseItem[];
  subtotal: number;
  totalCGST: number;
  totalSGST: number;
  totalIGST: number;
  totalGST: number;
  grandTotal: number;
  notes?: string;
  status: "draft" | "confirmed" | "cancelled";
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
  },
});

const SupplierSnapshotSchema = new Schema({
  supplierId: {
    type: Schema.Types.ObjectId,
    ref: "Supplier",
    required: true,
  },
  supplierName: {
    type: String,
    required: true,
  },
  companyName: {
    type: String,
    required: true,
  },
  phone: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
  },
  address: AddressSchema,
  gstNumber: {
    type: String,
    sparse: true,
  },
  state: {
    type: String,
    required: true,
  },
  isGSTRegistered: {
    type: Boolean,
    default: false,
  },
});

const PurchaseItemSchema = new Schema({
  productId: {
    type: Schema.Types.ObjectId,
    ref: "Product",
    required: true,
  },
  productName: {
    type: String,
    required: true,
  },
  quantity: {
    type: Number,
    required: true,
    min: 0,
  },
  purchasePrice: {
    type: Number,
    required: true,
    min: 0,
  },
  taxRate: {
    type: Number,
    required: true,
    default: 0,
    min: 0,
    max: 100,
  },
  taxableAmount: {
    type: Number,
    required: true,
    default: 0,
  },
  cgst: {
    type: Number,
    required: true,
    default: 0,
  },
  sgst: {
    type: Number,
    required: true,
    default: 0,
  },
  igst: {
    type: Number,
    required: true,
    default: 0,
  },
  totalAmount: {
    type: Number,
    required: true,
    default: 0,
  },
  unit: {
    type: String,
    required: true,
  },
});

const PurchaseSchema = new Schema<IPurchase>(
  {
    companyId: {
      type: Schema.Types.ObjectId,
      ref: "Company",
      required: true,
      index: true,
    },
    supplierId: {
      type: Schema.Types.ObjectId,
      ref: "Supplier",
      required: true,
    },
    purchaseNumber: {
      type: String,
      required: true,
      index: true,
      unique: true,
      sparse: true,
    },
    supplierSnapshot: SupplierSnapshotSchema,
    taxType: {
      type: String,
      enum: ["intra", "inter", "zero", "none"],
      required: true,
      default: "none",
    },
    items: [PurchaseItemSchema],
    subtotal: {
      type: Number,
      required: true,
      default: 0,
      min: 0,
    },
    totalCGST: {
      type: Number,
      required: true,
      default: 0,
      min: 0,
    },
    totalSGST: {
      type: Number,
      required: true,
      default: 0,
      min: 0,
    },
    totalIGST: {
      type: Number,
      required: true,
      default: 0,
      min: 0,
    },
    totalGST: {
      type: Number,
      required: true,
      default: 0,
      min: 0,
    },
    grandTotal: {
      type: Number,
      required: true,
      default: 0,
      min: 0,
    },
    notes: {
      type: String,
      default: "",
    },
    status: {
      type: String,
      enum: ["draft", "confirmed", "cancelled"],
      required: true,
      default: "draft",
      index: true,
    },
    isDeleted: {
      type: Boolean,
      default: false,
      index: true,
    },
  },
  { timestamps: true }
);

// Indexes for performance
PurchaseSchema.index({ companyId: 1, createdAt: -1 });
PurchaseSchema.index({ companyId: 1, supplierId: 1 });
PurchaseSchema.index({ companyId: 1, status: 1 });

const Purchase = mongoose.model<IPurchase>("Purchase", PurchaseSchema);

export { Purchase };
