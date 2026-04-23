// Shared TypeScript types for the application

export type UserRole = "superadmin" | "admin" | "user";

export interface Company {
  _id?: string;
  id: string;
  name: string;
  ownerId?: string;
  modules: ("sales" | "inventory" | "accounting" | "purchases" | "expenses")[];
  plan: "trial" | "free" | "basic" | "professional" | "enterprise";
  subscriptionStatus: "active" | "inactive" | "suspended";
  isActive: boolean;
  // Trial System
  trialStart?: Date | string;
  trialEnd?: Date | string;
  trialEnded?: boolean;
  businessInfo?: {
    businessName?: string;
    businessType?: string;
    industry?: string;
    businessAddress?: string;
  };
  gstStatus?: "YES" | "NO" | boolean;
  gstNumber?: string;
  gstDocumentUrl?: string;
  panNumber?: string;
  panDocumentUrl?: string;
  financialYearStart?: string;
  taxInfo?: {
    gstRegistration?: "YES" | "NO" | string;
    gstStatus?: "YES" | "NO" | string;
    gstNumber?: string;
    gstin?: string;
    gstDocumentUrl?: string;
    panNumber?: string;
    panDocumentUrl?: string;
    financialYearStart?: string;
  };
  bankInfo?: {
    accountHolder?: string;
    accountNumber?: string;
    ifscCode?: string;
    bankName?: string;
    branchName?: string;
  };
}

export interface UserPermissions {
  [module: string]: {
    view?: boolean;
    create?: boolean;
    update?: boolean;
    delete?: boolean;
  };
}

export interface User {
  phone: string;
  status: string;
  createdAt: string | undefined;
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: UserRole;
  companyId?: string;  // NEW: Which company user belongs to
  isActive: boolean;   // NEW: Whether user is active
  isVerified?: boolean;
  isEmailVerified?: boolean;
  isFirstLogin?: boolean;
  isModuleAssigned?: boolean;
  permissions: UserPermissions;
  onboardingCompleted: boolean;
  onboarding?: {
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
}

export interface Customer {
  id: number;
  name: string;
  customer_type: string;
  Phone: string;
  Gst: string;
  Outstanding: number;
  status: string;
}

export interface Invoice {
  id: number;
  invoice: string;
  date: string;
  customer: string;
  amount: number;
  duedate: string;
  status: string;
}

export interface Payment {
  _id?: string;
  id?: number;
  userId?: string;
  date: string;
  invoice: string;
  customer: string;
  Amount: number;
  paymentmode: string;
  reference: string;
  notes?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface Product {
  _id?: string;
  id?: number;
  userId?: string;
  productName: string;
  sku: string;
  category: string;
  description?: string;
  salePrice: number;
  purchasePrice?: number;
  currentStock?: number;
  unit: string;
  gst?: number;
  status: "active" | "inactive";
  createdAt?: string;
  updatedAt?: string;
}

export interface StockItem {
  id: number;
  productname: string;
  currentstock: number;
  lastupdated: string;
}

export interface CashBankRecord {
  id: number;
  date: string;
  description: string;
  amount: number;
  mode: string;
  balance: number;
}

export interface SalesReturn {
  id: number;
  ReturnID: string;
  date: string;
  originalinvoice: string;
  customer: string;
  iteams: string;
  Amount: number;
  status: string;
}
