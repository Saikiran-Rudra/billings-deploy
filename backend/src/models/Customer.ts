import mongoose, { Schema, Document } from "mongoose";

export interface ICustomer extends Document {
  companyId: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  customerType: "Business" | "Individual";
  salutation: string;
  firstName: string;
  lastName: string;
  companyName: string;
  displayName: string;
  email: string;
  companyNumber: string;
  primaryPhone: string;
  alternatePhone: string;

  // GST details
  gstTreatment: string;
  gstNumber: string;
  gstName: string;
  tradeName: string;
  reverseCharge: string;
  reverseChargeReason: string;
  countryOfResidence: string;

  // Billing address
  billing: {
    street: string;
    city: string;
    state: string;
    pinCode: string;
    country: string;
  };

  // Shipping address
  sameAsBilling: boolean;
  shipping: {
    street: string;
    city: string;
    state: string;
    pinCode: string;
    country: string;
  };

  // Tax information
  placeOfSupply: string;
  panNumber: string;
  taxPreference: "tax" | "exempted" | "";
  taxExemptionReason: string;
  defaultTaxRate: string;

  // Payment settings
  openingBalance: number;
  creditLimit: number;
  paymentTerms: string;
  preferredPaymentMethod: string;

  // Additional details
  notes: string;
  tags: string[];
  customerStatus: "active" | "inactive" | "blocked";

  createdAt: Date;
  updatedAt: Date;
}

const customerSchema = new Schema<ICustomer>(
  {
    companyId: { type: Schema.Types.ObjectId, ref: "Company", required: true, index: true },
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },

    customerType: {
      type: String,
      enum: ["Business", "Individual"],
      required: [true, "Customer type is required"],
    },
    salutation: { type: String, trim: true, default: "" },
    firstName: {
      type: String,
      required: [true, "First name is required"],
      trim: true,
      minlength: [1, "First name cannot be empty"],
    },
    lastName: {
      type: String,
      required: [true, "Last name is required"],
      trim: true,
      minlength: [1, "Last name cannot be empty"],
    },
    companyName: { type: String, trim: true, default: "" },
    displayName: {
      type: String,
      required: [true, "Display name is required"],
      trim: true,
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      trim: true,
      lowercase: true,
      match: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, "Please enter a valid email"],
    },
    companyNumber: { type: String, trim: true, default: "" },
    primaryPhone: {
      type: String,
      required: [true, "Primary phone is required"],
      trim: true,
    },
    alternatePhone: { type: String, trim: true, default: "" },

    // GST details
    gstTreatment: { type: String, trim: true, default: "" },
    gstNumber: {
      type: String,
      trim: true,
      default: "",
      validate: {
        validator: function (v: string) {
          return v === "" || v.length === 15;
        },
        message: "GST Number must be exactly 15 characters when provided",
      },
    },
    gstName: { type: String, trim: true, default: "" },
    tradeName: { type: String, trim: true, default: "" },
    reverseCharge: { type: String, trim: true, default: "" },
    reverseChargeReason: { type: String, trim: true, default: "" },
    countryOfResidence: { type: String, trim: true, default: "" },

    // Billing address
    billing: {
      street: { type: String, trim: true, default: "" },
      city: { type: String, trim: true, default: "" },
      state: { type: String, trim: true, default: "" },
      pinCode: { type: String, trim: true, default: "" },
      country: { type: String, trim: true, default: "" },
    },
    sameAsBilling: { type: Boolean, default: false },
    
    // Shipping address
    shipping: {
      street: { type: String, trim: true, default: "" },
      city: { type: String, trim: true, default: "" },
      state: { type: String, trim: true, default: "" },
      pinCode: { type: String, trim: true, default: "" },
      country: { type: String, trim: true, default: "" },
    },

    // Tax information
    placeOfSupply: { type: String, trim: true, default: "" },
    panNumber: {
      type: String,
      trim: true,
      default: "",
      validate: {
        validator: function (v: string) {
          if (v === "") return true;
          const panRegex = /^[A-Z]{5}[0-9]{4}[A-Z]$/;
          return panRegex.test(v);
        },
        message: "Invalid PAN format",
      },
    },
    taxPreference: { type: String, enum: ["tax", "exempted", ""], default: "" },
    taxExemptionReason: { type: String, trim: true, default: "" },
    defaultTaxRate: { type: String, trim: true, default: "" },

    // Payment settings
    openingBalance: { type: Number, default: 0, min: 0 },
    creditLimit: { type: Number, default: 0, min: 0 },
    paymentTerms: { type: String, trim: true, default: "" },
    preferredPaymentMethod: { type: String, trim: true, default: "" },

    // Additional details
    notes: { type: String, trim: true, default: "" },
    tags: [{ type: String, trim: true }],
    customerStatus: {
      type: String,
      enum: ["active", "inactive", "blocked"],
      default: "active",
    },
  },
  { timestamps: true }
);

// Compound index: unique email per user
customerSchema.index({ userId: 1, email: 1 }, { unique: true });

const Customer = mongoose.model<ICustomer>("Customer", customerSchema);

export default Customer;
