import mongoose, { Schema, Document } from "mongoose";
import bcrypt from "bcryptjs";
import crypto from "crypto";

export type UserRole = "superadmin" | "admin" | "user";

export interface IPermissions {
  [module: string]: {
    view?: boolean;
    create?: boolean;
    update?: boolean;
    delete?: boolean;
  };
}

export interface IUser extends Document {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  password: string;
  resetPasswordToken?: string;
  resetPasswordExpire?: Date;
  
  // Email Verification (NEW)
  isVerified: boolean;
  isEmailVerified: boolean;
  verificationToken?: string;
  verificationTokenExpire?: Date;
  
  role: UserRole;
  permissions: IPermissions;
  tenantId?: string;
  companyId?: mongoose.Types.ObjectId;
  isActive: boolean;
  isFirstLogin: boolean;
  isModuleAssigned: boolean;
  onboarding: {
    business: {
      businessName: string;
      businessType: string;
      industry: string;
      businessAddress: string;
    };
    bank: {
      bankName: string;
      accountNumber: string;
      ifscCode: string;
      branchName: string;
    };
    tax: {
      gstRegistration: string;
      gstin: string;
      panNumber: string;
      financialYearStart: string;
    };
    completed: boolean;
  };
  createdAt: Date;
  updatedAt: Date;
  comparePassword(candidatePassword: string): Promise<boolean>;
  generateResetToken(): string;
  generateVerificationToken(): string;
}

const userSchema = new Schema<IUser>(
  {
    firstName: { type: String, required: true, trim: true },
    lastName: { type: String, required: true, trim: true },
    email: { type: String, required: true, lowercase: true, trim: true },
    phone: { type: String, trim: true, default: "" },
    password: { type: String, required: true, minlength: 6 },
    resetPasswordToken: { type: String, default: null },
    resetPasswordExpire: { type: Date, default: null },
    
    // Email Verification (NEW)
    isVerified: { type: Boolean, default: false, index: true },
    isEmailVerified: { type: Boolean, default: false, index: true },
    verificationToken: { type: String, default: null, sparse: true },
    verificationTokenExpire: { type: Date, default: null },
    
    role: { type: String, enum: ["superadmin", "admin", "user"], default: "admin" },
    permissions: { type: Schema.Types.Mixed, default: {} },
    tenantId: { type: String, default: null },
    companyId: { 
      type: Schema.Types.ObjectId, 
      ref: "Company", 
      default: null,
      index: true,
    },
    isActive: { type: Boolean, default: true, index: true },
    isFirstLogin: { type: Boolean, default: false, index: true },
    isModuleAssigned: { type: Boolean, default: true, index: true },
    onboarding: {
      business: {
        businessName: { type: String, default: "" },
        businessType: { type: String, default: "" },
        industry: { type: String, default: "" },
        businessAddress: { type: String, default: "" },
      },
      bank: {
        bankName: { type: String, default: "" },
        accountNumber: { type: String, default: "" },
        ifscCode: { type: String, default: "" },
        branchName: { type: String, default: "" },
      },
      tax: {
        gstRegistration: { type: String, default: "" },
        gstin: { type: String, default: "" },
        panNumber: { type: String, default: "" },
        financialYearStart: { type: String, default: "April" },
      },
      completed: { type: Boolean, default: false },
    },
  },
  { timestamps: true }
);

// Hash password before saving
userSchema.pre("save", async function () {
  if (!this.isModified("password")) return;
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// Compare password method
userSchema.methods.comparePassword = async function (candidatePassword: string): Promise<boolean> {
  return bcrypt.compare(candidatePassword, this.password);
};

//

// Generate and hash verification token
userSchema.methods.generateVerificationToken = function (): string {
  const verificationToken = crypto.randomBytes(32).toString("hex");
  this.verificationToken = crypto.createHash("sha256").update(verificationToken).digest("hex");
  this.verificationTokenExpire = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours
  return verificationToken;
};

// Generate and hash reset token
userSchema.methods.generateResetToken = function (): string {
  const resetToken = crypto.randomBytes(32).toString("hex");
  this.resetPasswordToken = crypto.createHash("sha256").update(resetToken).digest("hex");
  this.resetPasswordExpire = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes
  return resetToken;
};

// Email unique per company, allowing same email across different companies (multi-tenant)
userSchema.index({ email: 1, companyId: 1 }, { unique: true, sparse: true });

const User = mongoose.model<IUser>("User", userSchema);

export default User;
