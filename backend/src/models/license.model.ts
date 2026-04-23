import mongoose from "mongoose";

const licenseSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },

    price: { type: Number, required: true },
    durationInDays: { type: Number, required: true },

    userLimit: { type: Number, required: true },

    features: {
      companies: { type: Boolean, default: false },
      supplier: { type: Boolean, default: false },
      purchase: { type: Boolean, default: false },
      reports: { type: Boolean, default: false },
      apiAccess: { type: Boolean, default: false }
    },

    isActive: { type: Boolean, default: true }
  },
  { timestamps: true }
);

export const License = mongoose.model("License", licenseSchema);