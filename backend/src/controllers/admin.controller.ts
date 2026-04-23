import { Request, Response } from "express";
import User from "../models/User.js";
import Company from "../models/Company.js";
import AppError from "../utils/AppError.js";
import asyncHandler from "../utils/asyncHandler.js";
import { companyService } from "../services/company.service.js";

// GET /api/admin/dashboard - Get dashboard metrics
export const getDashboard = asyncHandler(
  async (req: Request, res: Response) => {
    console.log("[getDashboard] Starting...");
    const user = (req as any).user;
    console.log("[getDashboard] user.role:", user?.role);

    // Allow superadmin and admin to access
    if (user?.role !== "superadmin" && user?.role !== "admin") {
      console.log("[getDashboard] Access denied - user role:", user?.role);
      throw new AppError(403, "Only admins and superadmins can access this endpoint");
    }

    console.log("[getDashboard] Fetching metrics...");
    
    try {
      // Get metrics
      const totalCompanies = await Company.countDocuments();
      const totalUsers = await User.countDocuments();
      const activeCompanies = await Company.countDocuments({
        status: "active",
      });
      const inactiveCompanies = await Company.countDocuments({
        status: "inactive",
      });

      console.log("[getDashboard] Metrics fetched. Fetching recent data...");

      // Get recent companies (last 5)
      const recentCompaniesRaw = await Company.find()
        .sort({ createdAt: -1 })
        .limit(5)
        .select("name email status plan createdAt _id")
        .lean();

      console.log("[getDashboard] Recent companies fetched:", recentCompaniesRaw.length);

      // Format companies response
      const recentCompanies = recentCompaniesRaw.map((company: any) => ({
        _id: company._id?.toString() || company._id,
        name: company.name,
        email: company.email,
        status: company.status,
        plan: company.plan,
        createdAt: company.createdAt,
      }));

      // Get recent users (last 5) - fetch without populate first
      const recentUsersRaw = await User.find()
        .sort({ createdAt: -1 })
        .limit(5)
        .select("name email role status companyId createdAt _id")
        .lean();

      console.log("[getDashboard] Recent users fetched:", recentUsersRaw.length);

      // Format users response - manually handle company population
      const formattedUsers = [];
      for (const userRecord of recentUsersRaw) {
        try {
          let companyData = null;
          
          if (userRecord.companyId) {
            try {
              const company = await Company.findById(userRecord.companyId).select("name _id").lean();
              if (company) {
                companyData = {
                  name: company.name,
                  _id: company._id.toString(),
                };
              }
            } catch (companyError) {
              console.log("[getDashboard] Could not populate company for user:", userRecord._id, userRecord.companyId);
              // Continue without company data
            }
          }

          formattedUsers.push({
            _id: userRecord._id.toString(),
            name: `${userRecord.firstName} ${userRecord.lastName}`.trim(),
            email: userRecord.email,
            role: userRecord.role,
            status: userRecord.isActive ? "active" : "inactive",
            company: companyData,
            createdAt: userRecord.createdAt,
          });
        } catch (userError) {
          console.log("[getDashboard] Error processing user:", userError);
          // Skip this user
        }
      }

      console.log("[getDashboard] Sending response...");
      res.status(200).json({
        totalCompanies,
        totalUsers,
        activeCompanies,
        inactiveCompanies,
        recentCompanies,
        recentUsers: formattedUsers,
      });
    } catch (error) {
      console.error("[getDashboard] Error in dashboard metrics:", error instanceof Error ? error.message : error);
      throw error;
    }
  }
);

// ============= COMPANY MANAGEMENT =============

/**
 * Create a new company (Super Admin only)
 * POST /api/admin/companies
 */
export const createCompany = asyncHandler(
  async (req: Request, res: Response) => {
    const user = (req as any).user;
    
    // Only Super Admin can create companies
    if (user?.role !== "superadmin") {
      throw new AppError(403, "Only Super Admin can create companies");
    }

    const company = await companyService.createCompanyWithAdmin(
      req.body,
      req.userId
    );

    res.status(201).json({
      success: true,
      message: "Company and admin user created successfully",
      data: company,
    });
  }
);

/**
 * Get all companies (Super Admin only)
 * GET /api/admin/companies?page=1&limit=20&search=name
 */
export const getCompanies = asyncHandler(
  async (req: Request, res: Response) => {
    const user = (req as any).user;
    
    // Only Super Admin can view all companies
    if (user?.role !== "superadmin") {
      throw new AppError(403, "Only Super Admin can view companies");
    }

    const result = await companyService.getCompanies(req.query);

    res.status(200).json({
      success: true,
      data: result.data,
      pagination: result.pagination,
    });
  }
);

/**
 * Get company by ID (Super Admin only)
 * GET /api/admin/companies/:id
 */
export const getCompanyById = asyncHandler(
  async (req: Request, res: Response) => {
    const user = (req as any).user;
    
    // Only Super Admin can view company details
    if (user?.role !== "superadmin") {
      throw new AppError(403, "Only Super Admin can view company details");
    }

    const company = await companyService.getCompanyById(String(req.params.id));

    res.status(200).json({
      success: true,
      data: company,
    });
  }
);

/**
 * Update company (Super Admin only)
 * PUT /api/admin/companies/:id
 */
export const updateCompany = asyncHandler(
  async (req: Request, res: Response) => {
    const user = (req as any).user;
    
    // Only Super Admin can update companies
    if (user?.role !== "superadmin") {
      throw new AppError(403, "Only Super Admin can update companies");
    }

    const company = await companyService.updateCompany(String(req.params.id), req.body);

    res.status(200).json({
      success: true,
      message: "Company updated successfully",
      data: company,
    });
  }
);

/**
 * Update company status (Super Admin only)
 * PATCH /api/admin/companies/:id/status
 */
export const updateCompanyStatus = asyncHandler(
  async (req: Request, res: Response) => {
    const user = (req as any).user;
    
    // Only Super Admin can update company status
    if (user?.role !== "superadmin") {
      throw new AppError(403, "Only Super Admin can update company status");
    }

    const company = await companyService.toggleCompanyStatus(
      String(req.params.id),
      req.body.status
    );

    res.status(200).json({
      success: true,
      message: "Company status updated successfully",
      data: company,
    });
  }
);
