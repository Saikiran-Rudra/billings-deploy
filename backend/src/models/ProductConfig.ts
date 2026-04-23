import mongoose, { Schema, Document } from "mongoose";
import { ProductConfig } from "../config/product.config.js";

export interface IProductConfig extends Document {
  userId: mongoose.Types.ObjectId;
  categories: string[];
  units: string[];
  gstRates: number[];
  sku: {
    prefix: string;
    sequence: number;
  };
  defaultHSN: string;
  allowNegativeStock: boolean;
  lowStockThreshold: number;
  createdAt: Date;
  updatedAt: Date;
}

const productConfigSchema = new Schema<IProductConfig>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, unique: true, index: true },
    categories: { type: [String], default: [] },
    units: { type: [String], default: [] },
    gstRates: { type: [Number], default: [] },
    sku: {
      prefix: { type: String, default: "SKU" },
      sequence: { type: Number, default: 1000 },
    },
    defaultHSN: { type: String, default: "999999" },
    allowNegativeStock: { type: Boolean, default: false },
    lowStockThreshold: { type: Number, default: 10 },
  },
  { timestamps: true }
);

const ProductConfig = mongoose.model<IProductConfig>("ProductConfig", productConfigSchema);

export default ProductConfig;
