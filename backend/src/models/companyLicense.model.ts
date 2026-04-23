import mongoose from "mongoose";

const companyLicenseSchema = new mongoose.Schema(
  {
    companyId: {
      type: mongoose.Types.ObjectId,
      ref: "Company",
      required: true
    },

    licenseId: {
      type: mongoose.Types.ObjectId,
      ref: "License",
      required: true
    },

    startDate: Date,
    expiryDate: Date,

    status: {
      type: String,
      enum: ["ACTIVE", "EXPIRED"],
      default: "ACTIVE"
    },

    userLimitSnapshot: Number,
    featuresSnapshot: Object
  },
  { timestamps: true }
);

export const CompanyLicense = mongoose.model(
  "CompanyLicense",
  companyLicenseSchema
);