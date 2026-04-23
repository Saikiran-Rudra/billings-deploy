import mongoose, { Schema, Document } from "mongoose";
import { GST_STATUS_VALUES, type GstStatusValue } from "../constants/company.constants.js";

export interface ICompany extends Document {
  name: string;
  ownerId: mongoose.Types.ObjectId;
  ownerEmail: string;
  phone?: string;
  description?: string;
  businessType?: string;
  industry?: string;
  address?: string;
  financialYearStart?: string;
  gstStatus: GstStatusValue;
  gstNumber?: string;
  gstDocumentUrl?: string;
  panNumber?: string;
  panDocumentUrl?: string;
  createdBy?: mongoose.Types.ObjectId;
  
  // Modules/Features
  modules: ("sales" | "inventory" | "accounting" | "purchases" | "expenses")[];
  
  // Settings
  businessInfo: {
    businessName?: string;
    businessType?: string;
    industry?: string;
    businessAddress?: string;
    registrationNumber?: string;
    taxId?: string;
  };
  
  bankInfo: {
    bankName?: string;
    accountNumber?: string;
    ifscCode?: string;
    branchName?: string;
  };
  
  taxInfo: {
    gstRegistration?: string;
    gstin?: string;
    panNumber?: string;
    financialYearStart?: string;
  };
  
  // Feature flags
  features: {
    multiCurrency?: boolean;
    advancedReporting?: boolean;
    automatedInvoicing?: boolean;
    inventoryTracking?: boolean;
  };
  
  // Subscription
  plan: "trial" | "free" | "basic" | "professional" | "enterprise";
  subscriptionStatus: "active" | "inactive" | "suspended";
  subscriptionStartDate?: Date;
  subscriptionEndDate?: Date;
  
  // Trial System (NEW)
  trialStart?: Date;
  trialEnd?: Date;
  trialEnded?: boolean;
  
  // Status
  status: "active" | "inactive" | "archived";
  isActive: boolean;
  
  createdAt: Date;
  updatedAt: Date;
  
  // Helper methods (NEW)
  isTrialActive(): boolean;
  getRemainingTrialDays(): number;
}

const companySchema = new Schema<ICompany>(
  {
    name: { type: String, required: true, trim: true, index: true },
    ownerId: { 
      type: Schema.Types.ObjectId, 
      ref: "User", 
      required: true, 
      index: true 
    },
    ownerEmail: { type: String, required: true, lowercase: true, trim: true },
    phone: { type: String, trim: true, default: "" },
    description: { type: String, trim: true, default: "" },
    businessType: { type: String, trim: true, default: "" },
    industry: { type: String, trim: true, default: "" },
    address: { type: String, trim: true, default: "" },
    financialYearStart: { type: String, trim: true, default: "April" },
    gstStatus: { type: String, enum: GST_STATUS_VALUES, default: "NO" },
    gstNumber: { type: String, trim: true, uppercase: true, default: "" },
    gstDocumentUrl: { type: String, default: "" },
    panNumber: { type: String, trim: true, uppercase: true, default: "" },
    panDocumentUrl: { type: String, default: "" },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      default: null,
      index: true,
    },
    
    modules: {
      type: [String],
      enum: ["sales", "inventory", "accounting", "purchases", "expenses"],
      default: ["sales", "inventory", "accounting"],
    },
    
    businessInfo: {
      businessName: { type: String, trim: true, default: "" },
      businessType: { type: String, trim: true, default: "" },
      industry: { type: String, trim: true, default: "" },
      businessAddress: { type: String, trim: true, default: "" },
      registrationNumber: { type: String, trim: true, default: "" },
      taxId: { type: String, trim: true, default: "" },
    },
    
    bankInfo: {
      bankName: { type: String, trim: true, default: "" },
      accountNumber: { type: String, trim: true, default: "" },
      ifscCode: { type: String, trim: true, default: "" },
      branchName: { type: String, trim: true, default: "" },
    },
    
    taxInfo: {
      gstRegistration: { type: String, trim: true, enum: GST_STATUS_VALUES, default: "NO" },
      gstin: { type: String, trim: true, default: "" },
      panNumber: { type: String, trim: true, default: "" },
      financialYearStart: { type: String, default: "April" },
    },
    
    features: {
      multiCurrency: { type: Boolean, default: false },
      advancedReporting: { type: Boolean, default: false },
      automatedInvoicing: { type: Boolean, default: true },
      inventoryTracking: { type: Boolean, default: true },
    },
    
    plan: { 
      type: String, 
      enum: ["trial", "free", "basic", "professional", "enterprise"],
      default: "trial" 
    },
    
    subscriptionStatus: {
      type: String,
      enum: ["active", "inactive", "suspended"],
      default: "inactive",
    },
    
    subscriptionStartDate: { type: Date, default: undefined },
    subscriptionEndDate: { type: Date, default: undefined },
    
    // Trial System (NEW)
    trialStart: { type: Date, default: () => new Date() },
    trialEnd: { 
      type: Date,
      default: () => new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days
    },
    trialEnded: { type: Boolean, default: false },
    
    status: {
      type: String,
      enum: ["active", "inactive", "archived"],
      default: "active",
    },
    
    isActive: { type: Boolean, default: true, index: true },
  },
  { timestamps: true }
);

// Indexes
companySchema.index({ ownerId: 1, createdAt: -1 });
companySchema.index({ status: 1, isActive: 1 });

// Trial System Helper Methods (NEW)
companySchema.methods.isTrialActive = function (): boolean {
  if (this.plan !== "trial" || this.trialEnded) return false;
  return new Date() < this.trialEnd;
};

companySchema.methods.getRemainingTrialDays = function (): number {
  if (!this.isTrialActive()) return 0;
  const diffTime = this.trialEnd.getTime() - new Date().getTime();
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
};

const Company = mongoose.model<ICompany>("Company", companySchema);

export default Company;
