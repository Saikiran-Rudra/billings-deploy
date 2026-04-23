import { Types } from "mongoose";
import Company, { ICompany } from "../models/Company.js";
import User, { IPermissions } from "../models/User.js";
import AppError from "../utils/AppError.js";
import sendEmail from "../utils/send-email.js";
import {
  COMPANY_STATUS,
  GST_STATUS,
  type GstStatusValue,
} from "../constants/company.constants.js";
import { USER_ROLES } from "../constants/user.constants.js";
import {
  companyCreateSchema,
  companyListQuerySchema,
  companyStatusSchema,
  companyUpdateSchema,
} from "../validators/company.validator.js";
import {
  CompanyCreateInput,
  CompanyListQuery,
  CompanyUpdateInput,
} from "../types/company.types.js";

const formatValidationError = (error: { issues: { message: string }[] }) =>
  error.issues.map((issue) => issue.message).join(", ");

const FULL_ACCESS_PERMISSIONS: IPermissions = {
  product: { view: true, create: true, update: true, delete: true },
  customer: { view: true, create: true, update: true, delete: true },
  sales: { view: true, create: true, update: true, delete: true },
  invoice: { view: true, create: true, update: true, delete: true },
  payment: { view: true, create: true, update: true, delete: true },
  report: { view: true, create: true, update: true, delete: true },
  user: { view: true, create: true, update: true, delete: true },
};

const sanitizePasswordPart = (value: string) =>
  value.replace(/[^a-zA-Z0-9]/g, "").slice(0, 16) || "Company";

const generateTemporaryPassword = (companyName: string, role: string) => {
  const randomDigits = Math.floor(100 + Math.random() * 900);
  const normalizedRole = role.charAt(0).toUpperCase() + role.slice(1);
  return `${sanitizePasswordPart(companyName)}@${normalizedRole}${randomDigits}`;
};

const sendCredentialsEmail = async (
  email: string,
  firstName: string,
  companyName: string,
  temporaryPassword: string
) => {
  const loginUrl = `${process.env.FRONTEND_URL || "http://localhost:3000"}/login`;

  await sendEmail({
    to: email,
    subject: `Your Account Has Been Created at ${companyName}`,
    html: `
      <h2>Your Hisab Kitab account is ready</h2>
      <p>Hi ${firstName},</p>
      <p>Your admin account has been created for <strong>${companyName}</strong>.</p>
      <p><strong>Email:</strong> ${email}</p>
      <p><strong>Temporary password:</strong> ${temporaryPassword}</p>
      <p>Login here: <a href="${loginUrl}">${loginUrl}</a></p>
      <p>You will be asked to change this password on your first login.</p>
    `,
  });
};

const normalizeGstStatus = (value: unknown): GstStatusValue | undefined => {
  if (typeof value === "boolean") {
    return value ? GST_STATUS.YES : GST_STATUS.NO;
  }

  if (typeof value === "string") {
    const normalized = value.trim().toUpperCase();
    if (normalized === GST_STATUS.YES || normalized === "TRUE") {
      return GST_STATUS.YES;
    }

    if (normalized === GST_STATUS.NO || normalized === "FALSE") {
      return GST_STATUS.NO;
    }
  }

  return undefined;
};

export const normalizeCompanyTaxFields = (
  company: Pick<ICompany, "gstStatus" | "taxInfo">
) => {
  const normalizedGstStatus =
    normalizeGstStatus(company.gstStatus) ??
    normalizeGstStatus(company.taxInfo?.gstRegistration) ??
    GST_STATUS.NO;

  company.gstStatus = normalizedGstStatus;
  company.taxInfo.gstRegistration = normalizedGstStatus;
};

export const validateCompanyTaxConfiguration = (company: Pick<ICompany, "gstStatus" | "gstNumber" | "gstDocumentUrl" | "panNumber" | "panDocumentUrl">) => {
  if (!company.panNumber?.trim()) {
    throw new AppError(400, "PAN number is required");
  }

  if (!company.panDocumentUrl?.trim()) {
    throw new AppError(400, "PAN document is required");
  }

  if (company.gstStatus === GST_STATUS.YES) {
    if (!company.gstNumber?.trim()) {
      throw new AppError(400, "GST number is required when GST registration is YES");
    }

    if (!company.gstDocumentUrl?.trim()) {
      throw new AppError(400, "GST document is required when GST registration is YES");
    }
  }
};

const hasTaxInput = (input: CompanyUpdateInput) =>
  input.gstStatus !== undefined ||
  input.gstNumber !== undefined ||
  input.gstDocumentUrl !== undefined ||
  input.panNumber !== undefined ||
  input.panDocumentUrl !== undefined;

const applyCompanyFields = (
  company: ICompany,
  input: CompanyUpdateInput
) => {
  if (input.name !== undefined) company.name = input.name.trim();
  if (input.businessType !== undefined) company.businessType = input.businessType;
  if (input.industry !== undefined) company.industry = input.industry;
  if (input.address !== undefined) {
    company.address = input.address;
    company.businessInfo.businessAddress = input.address;
  }
  if (input.financialYearStart !== undefined) {
    company.financialYearStart = input.financialYearStart;
    company.taxInfo.financialYearStart = input.financialYearStart;
  }
  if (input.gstStatus !== undefined) {
    const normalizedGstStatus = normalizeGstStatus(input.gstStatus);
    if (normalizedGstStatus) {
      company.gstStatus = normalizedGstStatus;
      company.taxInfo.gstRegistration = normalizedGstStatus;
    }
  }
  if (input.gstNumber !== undefined) {
    company.gstNumber = input.gstNumber || "";
    company.taxInfo.gstin = input.gstNumber || "";
  }
  if (input.gstDocumentUrl !== undefined) company.gstDocumentUrl = input.gstDocumentUrl || "";
  if (input.panNumber !== undefined) {
    company.panNumber = input.panNumber;
    company.taxInfo.panNumber = input.panNumber;
  }
  if (input.panDocumentUrl !== undefined) company.panDocumentUrl = input.panDocumentUrl || "";
};

export const companyService = {
  async getCompanies(rawQuery: unknown) {
    const parsed = companyListQuerySchema.safeParse(rawQuery);
    if (!parsed.success) {
      throw new AppError(400, formatValidationError(parsed.error));
    }

    const query = parsed.data as CompanyListQuery;
    const page = query.page || 1;
    const limit = query.limit || 20;
    const skip = (page - 1) * limit;
    const filter = query.search
      ? {
          $or: [
            { name: { $regex: query.search, $options: "i" } },
            { ownerEmail: { $regex: query.search, $options: "i" } },
            { industry: { $regex: query.search, $options: "i" } },
          ],
        }
      : {};

    const [companies, total] = await Promise.all([
      Company.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit),
      Company.countDocuments(filter),
    ]);

    return {
      data: companies,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    };
  },

  async getCompanyById(id: string) {
    const company = await Company.findById(id);
    if (!company) {
      throw new AppError(404, "Company not found");
    }

    return company;
  },

  async createCompanyWithAdmin(rawInput: CompanyCreateInput, createdBy?: string) {
    const parsed = companyCreateSchema.safeParse(rawInput);
    if (!parsed.success) {
      throw new AppError(400, formatValidationError(parsed.error));
    }

    const input = parsed.data;
    const existingCompany = await Company.findOne({ name: input.name.trim() });
    if (existingCompany) {
      throw new AppError(400, "Company with this name already exists");
    }

    const existingAdmin = await User.findOne({ email: input.admin.email });
    if (existingAdmin) {
      throw new AppError(400, "Admin email already exists");
    }

    const temporaryPassword = generateTemporaryPassword(input.name, USER_ROLES.ADMIN);
    const admin = new User({
      firstName: input.admin.firstName,
      lastName: input.admin.lastName,
      email: input.admin.email,
      phone: input.admin.mobile,
      password: temporaryPassword,
      role: USER_ROLES.ADMIN,
      permissions: FULL_ACCESS_PERMISSIONS,
      isActive: true,
      isVerified: true,
      isEmailVerified: true,
      isFirstLogin: true,
      isModuleAssigned: true,
      onboarding: { completed: true },
    });

    await admin.save();

    const company = new Company({
      name: input.name.trim(),
      ownerId: admin._id,
      ownerEmail: input.admin.email,
      phone: input.admin.mobile,
      createdBy: createdBy ? new Types.ObjectId(createdBy) : undefined,
      status: COMPANY_STATUS.ACTIVE,
      isActive: true,
      subscriptionStatus: "active",
      plan: "trial",
      modules: ["sales", "inventory", "accounting"],
    });

    applyCompanyFields(company, input);
    normalizeCompanyTaxFields(company);
    company.businessInfo.businessName = input.name.trim();
    company.businessInfo.businessType = input.businessType;
    company.businessInfo.industry = input.industry;
    validateCompanyTaxConfiguration(company);

    await company.save();

    admin.companyId = company._id;
    await admin.save();

    try {
      await sendCredentialsEmail(input.admin.email, input.admin.firstName, input.name, temporaryPassword);
    } catch (error) {
      console.error("[createCompanyWithAdmin] Failed to send credentials email:", error);
    }

    return company;
  },

  async updateCompany(id: string, rawInput: CompanyUpdateInput) {
    const parsed = companyUpdateSchema.safeParse(rawInput);
    if (!parsed.success) {
      throw new AppError(400, formatValidationError(parsed.error));
    }

    const company = await Company.findById(id);
    if (!company) {
      throw new AppError(404, "Company not found");
    }

    applyCompanyFields(company, parsed.data);
    normalizeCompanyTaxFields(company);
    if (parsed.data.name) company.businessInfo.businessName = parsed.data.name;
    if (parsed.data.businessType) company.businessInfo.businessType = parsed.data.businessType;
    if (parsed.data.industry) company.businessInfo.industry = parsed.data.industry;
    if (hasTaxInput(parsed.data)) {
      validateCompanyTaxConfiguration(company);
    }

    await company.save();
    return company;
  },

  async toggleCompanyStatus(id: string, status?: string) {
    const company = await Company.findById(id);
    if (!company) {
      throw new AppError(404, "Company not found");
    }

    const nextStatus =
      status || (company.status === COMPANY_STATUS.ACTIVE ? COMPANY_STATUS.INACTIVE : COMPANY_STATUS.ACTIVE);
    const parsed = companyStatusSchema.safeParse({ status: nextStatus });
    if (!parsed.success) {
      throw new AppError(400, formatValidationError(parsed.error));
    }

    company.status = parsed.data.status;
    company.isActive = parsed.data.status === COMPANY_STATUS.ACTIVE;
    await Promise.all([
      company.save(),
      User.updateMany(
        { companyId: company._id },
        { isActive: parsed.data.status === COMPANY_STATUS.ACTIVE }
      ),
    ]);

    return company;
  },
};
