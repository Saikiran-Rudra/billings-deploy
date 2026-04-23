import mongoose, { Schema, Document } from "mongoose";

export interface IProduct extends Document {
  companyId: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  productName: string;
  sku: string;
  category: string;
  productType: "goods" | "service";
  description: string;
  salePrice: number;
  purchasePrice?: number;
  profitMargin: number;
  taxType: "inclusive" | "exclusive";
  barcode?: string;
  currentStock: number;
  unit: string;
  gst?: number;
  status: "active" | "inactive";
  createdAt: Date;
  updatedAt: Date;
}

const productSchema = new Schema<IProduct>(
  {
    companyId: { type: Schema.Types.ObjectId, ref: "Company", required: true, index: true },
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    productName: { type: String, required: true, trim: true, index: true },
    sku: { type: String, required: true, trim: true, unique: true, sparse: true, index: true },
    category: { type: String, trim: true, default: "", index: true },
    productType: { type: String, enum: ["goods", "service"], default: "goods" },
    description: { type: String, trim: true, default: "" },
    salePrice: { type: Number, required: true, min: 0 },
    purchasePrice: { type: Number, required: false, min: 0 },
    profitMargin: { type: Number, default: 0 },
    taxType: { type: String, enum: ["inclusive", "exclusive"], default: "exclusive" },
    barcode: { type: String, trim: true, sparse: true },
    currentStock: { type: Number, required: true, min: 0, default: 0 },
    unit: { type: String, required: true, trim: true, index: true },
    gst: { type: Number, required: false, min: 0, max: 100 },
    status: { type: String, enum: ["active", "inactive"], required: true, default: "active", index: true },
  },
  { timestamps: true }
);

// Indexes for performance
productSchema.index({ companyId: 1, userId: 1 });
productSchema.index({ companyId: 1, createdAt: -1 });

const Product = mongoose.model<IProduct>("Product", productSchema);

export default Product;
