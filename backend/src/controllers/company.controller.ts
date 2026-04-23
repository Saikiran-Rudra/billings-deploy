import { Request, Response } from "express";
import Company from "../models/Company.js";
import User from "../models/User.js";
import ActivityLog from "../models/ActivityLog.js";
import AppError from "../utils/AppError.js";
import { GST_STATUS } from "../constants/company.constants.js";
import {
  normalizeCompanyTaxFields,
  validateCompanyTaxConfiguration,
} from "../services/company.service.js";

const logActivity = async (
  req: Request,
  action: string,
  resource: string,
  resourceId?: string,
  details?: any
) => {
  try {
    const auditContext = (req as any).auditContext;
    if (auditContext) {
      await ActivityLog.create({
        companyId: auditContext.companyId,
        userId: auditContext.userId,
        action,
        module: "company",
        resource,
        resourceId,
        ipAddress: auditContext.ipAddress,
        userAgent: auditContext.userAgent,
        after: details,
        status: "success",
      });
    }
  } catch (error) {
    console.error("Activity logging error:", error);
  }
};

/**
 * Get all companies (SuperAdmin only)
 */
export const getAllCompanies = async (req: Request, res: Response) => {
  try {
    const user = req.user;

    if (!user || user.role !== "superadmin") {
      res.status(403).json({ message: "Only superadmins can view all companies" });
      return;
    }

    const companies = await Company.find()
      .populate("ownerId", "firstName lastName email")
      .sort({ createdAt: -1 });

    res.json({ companies });
  } catch (error) {
    console.error("Get all companies error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

/**
 * Get company details
 */
export const getCompany = async (req: Request, res: Response) => {
  try {
    const { companyId } = req.params;
    const user = req.user;

    if (!user) {
      res.status(401).json({ message: "Not authenticated" });
      return;
    }

    const company = await Company.findById(companyId).populate("ownerId", "firstName lastName email");

    if (!company) {
      res.status(404).json({ message: "Company not found" });
      return;
    }

    // Only superadmin or company owner/admin can view
    if (
      user.role !== "superadmin" &&
      user.companyId?.toString() !== companyId &&
      company.ownerId._id.toString() !== user._id.toString()
    ) {
      res.status(403).json({ message: "Not authorized to view this company" });
      return;
    }

    res.json({ company });
  } catch (error) {
    console.error("Get company error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

/**
 * Get my company (for regular users)
 */
export const getMyCompany = async (req: Request, res: Response) => {
  try {
    const user = req.user;

    if (!user) {
      res.status(401).json({ message: "Not authenticated" });
      return;
    }

    if (!user.companyId) {
      res.status(404).json({ message: "User not assigned to any company" });
      return;
    }

    const company = await Company.findById(user.companyId).populate("ownerId", "firstName lastName email");

    if (!company) {
      res.status(404).json({ message: "Company not found" });
      return;
    }

    res.json({ company });
  } catch (error) {
    console.error("Get my company error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

/**
 * Update company details (Admin/SuperAdmin)
 */
export const updateCompany = async (req: Request, res: Response) => {
  try {
    const { companyId } = req.params;
    const user = req.user;
    const {
      name,
      description,
      modules,
      businessInfo,
      bankInfo,
      taxInfo,
      features,
      plan,
      gstStatus,
      gstNumber,
      gstDocumentUrl,
      panNumber,
      panDocumentUrl,
      financialYearStart,
    } = req.body;

    const sanitizedTaxInfo =
      taxInfo && typeof taxInfo === "object"
        ? {
            ...(typeof taxInfo.gstRegistration === "string"
              ? { gstRegistration: taxInfo.gstRegistration }
              : {}),
            ...(typeof taxInfo.gstin === "string" ? { gstin: taxInfo.gstin } : {}),
            ...(typeof taxInfo.panNumber === "string"
              ? { panNumber: taxInfo.panNumber }
              : {}),
            ...(typeof taxInfo.financialYearStart === "string"
              ? { financialYearStart: taxInfo.financialYearStart }
              : {}),
          }
        : undefined;

    if (!user) {
      res.status(401).json({ message: "Not authenticated" });
      return;
    }

    const company = await Company.findById(companyId);

    if (!company) {
      res.status(404).json({ message: "Company not found" });
      return;
    }

    // Only superadmin or company admin can update
    if (
      user.role !== "superadmin" &&
      user.companyId?.toString() !== companyId &&
      company.ownerId.toString() !== user._id.toString()
    ) {
      res.status(403).json({ message: "Not authorized to update this company" });
      return;
    }

    // Update fields
    if (name) company.name = name;
    if (description !== undefined) company.description = description;
    if (modules) company.modules = modules;
    if (businessInfo) company.businessInfo = { ...company.businessInfo, ...businessInfo };
    if (bankInfo) company.bankInfo = { ...company.bankInfo, ...bankInfo };
    if (sanitizedTaxInfo) company.taxInfo = { ...company.taxInfo, ...sanitizedTaxInfo };
    if (features) company.features = { ...company.features, ...features };
    if (plan) company.plan = plan;
    if (financialYearStart !== undefined) {
      company.financialYearStart = financialYearStart;
      company.taxInfo = { ...company.taxInfo, financialYearStart };
    }

    const normalizedGstStatus =
      typeof gstStatus === "string"
        ? gstStatus.toUpperCase()
        : typeof sanitizedTaxInfo?.gstRegistration === "string"
          ? sanitizedTaxInfo.gstRegistration.toUpperCase()
          : undefined;

    if (normalizedGstStatus === GST_STATUS.YES || normalizedGstStatus === GST_STATUS.NO) {
      company.gstStatus = normalizedGstStatus;
      company.taxInfo = {
        ...company.taxInfo,
        gstRegistration: normalizedGstStatus,
      };
    }

    const resolvedGstNumber = gstNumber ?? sanitizedTaxInfo?.gstin;
    const resolvedPanNumber = panNumber ?? sanitizedTaxInfo?.panNumber;

    if (resolvedGstNumber !== undefined) {
      company.gstNumber = resolvedGstNumber;
      company.taxInfo = {
        ...company.taxInfo,
        gstin: resolvedGstNumber,
      };
    }

    if (resolvedPanNumber !== undefined) {
      company.panNumber = resolvedPanNumber;
      company.taxInfo = {
        ...company.taxInfo,
        panNumber: resolvedPanNumber,
      };
    }

    if (gstDocumentUrl !== undefined) company.gstDocumentUrl = gstDocumentUrl;
    if (panDocumentUrl !== undefined) company.panDocumentUrl = panDocumentUrl;
    normalizeCompanyTaxFields(company);

    const hasTaxPayload =
      gstStatus !== undefined ||
      gstNumber !== undefined ||
      gstDocumentUrl !== undefined ||
      panNumber !== undefined ||
      panDocumentUrl !== undefined ||
      sanitizedTaxInfo !== undefined;

    if (hasTaxPayload) {
      validateCompanyTaxConfiguration(company);
    }

    await company.save();

    const recordId = (companyId as string).split(',')[0] as string;
    await logActivity(req, "company_updated", "Company", recordId, {
      name,
      modules,
    });

    res.json({ message: "Company updated successfully", company });
  } catch (error) {
    console.error("Update company error:", error);
    if (error instanceof AppError) {
      res.status(error.statusCode).json({ message: error.message });
      return;
    }
    res.status(500).json({ message: "Server error" });
  }
};

/**
 * Delete company (SuperAdmin only)
 */
export const deleteCompany = async (req: Request, res: Response) => {
  try {
    const { companyId } = req.params;
    const user = req.user;

    if (!user || user.role !== "superadmin") {
      res.status(403).json({ message: "Only superadmins can delete companies" });
      return;
    }

    const company = await Company.findById(companyId);

    if (!company) {
      res.status(404).json({ message: "Company not found" });
      return;
    }

    // Archive instead of delete
    company.status = "archived";
    company.isActive = false;
    await company.save();

    // Deactivate all users in this company
    await User.updateMany(
      { companyId: companyId },
      { isActive: false }
    );

    const recordId = (companyId as string).split(',')[0] as string;
    await logActivity(req, "company_deleted", "Company", recordId);

    res.json({ message: "Company archived successfully" });
  } catch (error) {
    console.error("Delete company error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

/**
 * Enable/disable module for company
 */
export const toggleModule = async (req: Request, res: Response) => {
  try {
    const { companyId, module: moduleParam } = req.params;
    const { enabled } = req.body;
    const user = req.user;

    if (!user) {
      res.status(401).json({ message: "Not authenticated" });
      return;
    }

    const company = await Company.findById(companyId);

    if (!company) {
      res.status(404).json({ message: "Company not found" });
      return;
    }

    // Only superadmin or company admin can toggle modules
    if (
      user.role !== "superadmin" &&
      company.ownerId.toString() !== user._id.toString()
    ) {
      res.status(403).json({ message: "Not authorized to change modules" });
      return;
    }

    const module = Array.isArray(moduleParam) ? moduleParam[0] : moduleParam;
    const validModules = ["sales", "inventory", "accounting", "purchases", "expenses"];
    if (!validModules.includes(module)) {
      res.status(400).json({ message: "Invalid module" });
      return;
    }

    if (enabled) {
      if (!company.modules.includes(module as never)) {
        company.modules.push(module as never);
      }
    } else {
      company.modules = company.modules.filter(m => m !== module);
    }

    await company.save();

    await logActivity(req, enabled ? "module_enabled" : "module_disabled", "Module", module);

    res.json({
      message: `Module ${enabled ? "enabled" : "disabled"} successfully`,
      company,
    });
  } catch (error) {
    console.error("Toggle module error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

/**
 * Get company users
 */
export const getCompanyUsers = async (req: Request, res: Response) => {
  try {
    const { companyId } = req.params;
    const user = req.user;

    if (!user) {
      res.status(401).json({ message: "Not authenticated" });
      return;
    }

    // Verify authorization
    if (
      user.role !== "superadmin" &&
      user.companyId?.toString() !== companyId
    ) {
      res.status(403).json({ message: "Not authorized to view company users" });
      return;
    }

    const users = await User.find({ companyId })
      .select("-password")
      .sort({ createdAt: -1 });

    res.json({ users });
  } catch (error) {
    console.error("Get company users error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

/**
 * Get subscription details
 */
export const getSubscription = async (req: Request, res: Response) => {
  try {
    const { companyId } = req.params;
    const user = req.user;

    if (!user) {
      res.status(401).json({ message: "Not authenticated" });
      return;
    }

    const company = await Company.findById(companyId);

    if (!company) {
      res.status(404).json({ message: "Company not found" });
      return;
    }

    // Only superadmin or company admin
    if (
      user.role !== "superadmin" &&
      user.companyId?.toString() !== companyId
    ) {
      res.status(403).json({ message: "Not authorized" });
      return;
    }

    res.json({
      subscription: {
        plan: company.plan,
        status: company.subscriptionStatus,
        startDate: company.subscriptionStartDate,
        endDate: company.subscriptionEndDate,
        features: company.features,
      },
    });
  } catch (error) {
    console.error("Get subscription error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

/**
 * Update subscription (SuperAdmin only)
 */
export const updateSubscription = async (req: Request, res: Response) => {
  try {
    const { companyId } = req.params;
    const { plan, status } = req.body;
    const user = req.user;

    if (!user || user.role !== "superadmin") {
      res.status(403).json({ message: "Only superadmins can update subscriptions" });
      return;
    }

    const company = await Company.findByIdAndUpdate(
      companyId,
      {
        plan,
        subscriptionStatus: status,
        subscriptionStartDate: status === "active" ? new Date() : undefined,
      },
      { new: true }
    );

    if (!company) {
      res.status(404).json({ message: "Company not found" });
      return;
    }

    const recordId = (companyId as string).split(',')[0] as string;
    await logActivity(req, "settings_updated", "Subscription", recordId, {
      plan,
      status,
    });

    res.json({ message: "Subscription updated", company });
  } catch (error) {
    console.error("Update subscription error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

/**
 * Get users for my company (authenticated user's company)
 */
export const getCompanyUsersForMyCompany = async (req: Request, res: Response) => {
  try {
    const user = req.user;

    if (!user) {
      res.status(401).json({ message: "Not authenticated" });
      return;
    }

    if (!user.companyId) {
      res.status(404).json({ message: "User not assigned to any company" });
      return;
    }

    const users = await User.find({ companyId: user.companyId })
      .select("-password")
      .sort({ createdAt: -1 });

    // Map users with status field
    const mappedUsers = users.map((u) => ({
      _id: u._id,
      firstName: u.firstName,
      lastName: u.lastName,
      email: u.email,
      role: u.role,
      status: u.isActive ? "active" : "disabled",
      joinedDate: u.createdAt,
    }));

    res.json({ users: mappedUsers });
  } catch (error) {
    console.error("Get company users error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

/**
 * Invite user to my company
 */
export const inviteUserToCompany = async (req: Request, res: Response) => {
  try {
    const user = req.user;
    const { name, email, role } = req.body;

    if (!user) {
      res.status(401).json({ message: "Not authenticated" });
      return;
    }

    if (!user.companyId) {
      res.status(404).json({ message: "User not assigned to any company" });
      return;
    }

    // Only admins can invite users
    if (user.role !== "superadmin" && user.role !== "admin") {
      res.status(403).json({ message: "Only admins can invite users" });
      return;
    }

    if (!name || !email || !role) {
      res.status(400).json({ message: "Name, email, and role are required" });
      return;
    }

    // Check if user already exists
    let invitedUser = await User.findOne({ email });

    if (invitedUser) {
      if (invitedUser.companyId?.toString() === user.companyId?.toString()) {
        res.status(400).json({ message: "User already belongs to this company" });
        return;
      }
    } else {
      // Create new user with invited status
      invitedUser = await User.create({
        firstName: name.split(" ")[0] || name,
        lastName: name.split(" ").slice(1).join(" ") || "",
        email,
        password: Math.random().toString(36).slice(-8), // Generate random temp password
        role: role || "staff",
        companyId: user.companyId,
        isActive: true,
      });
    }

    // Add user to company if not already added
    if (!invitedUser.companyId) {
      invitedUser.companyId = user.companyId;
      invitedUser.role = role || "staff";
      await invitedUser.save();
    }

    const recordId = (invitedUser._id).toString().split(',')[0] as string;
    await logActivity(req, "user_invited", "User", recordId, {
      email: invitedUser.email,
      role: invitedUser.role,
    });

    res.status(201).json({
      message: "User invited successfully",
      user: {
        _id: invitedUser._id,
        firstName: invitedUser.firstName,
        lastName: invitedUser.lastName,
        email: invitedUser.email,
        role: invitedUser.role,
        status: "invited",
      },
    });
  } catch (error) {
    console.error("Invite user error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

/**
 * Remove user from my company
 */
export const removeUserFromCompany = async (req: Request, res: Response) => {
  try {
    const user = req.user;
    const { userId } = req.params;

    if (!user) {
      res.status(401).json({ message: "Not authenticated" });
      return;
    }

    if (!user.companyId) {
      res.status(404).json({ message: "User not assigned to any company" });
      return;
    }

    // Only admins can remove users
    if (user.role !== "superadmin" && user.role !== "admin") {
      res.status(403).json({ message: "Only admins can remove users" });
      return;
    }

    const targetUser = await User.findById(userId);

    if (!targetUser) {
      res.status(404).json({ message: "User not found" });
      return;
    }

    // Verify target user belongs to the same company
    if (targetUser.companyId?.toString() !== user.companyId?.toString()) {
      res.status(403).json({ message: "Not authorized to remove this user" });
      return;
    }

    // Remove company assignment
    targetUser.companyId = undefined;
    targetUser.isActive = false;
    await targetUser.save();

    const recordId = (userId as string).split(',')[0] as string;
    await logActivity(req, "user_removed", "User", recordId, {
      email: targetUser.email,
    });

    res.json({ message: "User removed from company" });
  } catch (error) {
    console.error("Remove user error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

/**
 * Disable user in my company
 */
export const disableUserInCompany = async (req: Request, res: Response) => {
  try {
    const user = req.user;
    const { userId } = req.params;
    const { status } = req.body;

    if (!user) {
      res.status(401).json({ message: "Not authenticated" });
      return;
    }

    if (!user.companyId) {
      res.status(404).json({ message: "User not assigned to any company" });
      return;
    }

    // Only admins can disable users
    if (user.role !== "superadmin" && user.role !== "admin") {
      res.status(403).json({ message: "Only admins can disable users" });
      return;
    }

    const targetUser = await User.findById(userId);

    if (!targetUser) {
      res.status(404).json({ message: "User not found" });
      return;
    }

    // Verify target user belongs to the same company
    if (targetUser.companyId?.toString() !== user.companyId?.toString()) {
      res.status(403).json({ message: "Not authorized to update this user" });
      return;
    }

    // Update status
    if (status === "disabled") {
      targetUser.isActive = false;
    } else if (status === "active") {
      targetUser.isActive = true;
    }

    await targetUser.save();

    const recordId = (userId as string).split(',')[0] as string;
    await logActivity(req, "user_disabled", "User", recordId, {
      email: targetUser.email,
      status,
    });

    res.json({
      message: "User status updated",
      user: {
        _id: targetUser._id,
        firstName: targetUser.firstName,
        lastName: targetUser.lastName,
        email: targetUser.email,
        role: targetUser.role,
        status: targetUser.isActive ? "active" : "disabled",
      },
    });
  } catch (error) {
    console.error("Disable user error:", error);
    res.status(500).json({ message: "Server error" });
  }
};
