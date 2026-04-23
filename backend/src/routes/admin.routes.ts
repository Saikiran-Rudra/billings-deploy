import { Router } from "express";
import { 
  getDashboard,
  createCompany,
  getCompanies,
  getCompanyById,
  updateCompany,
  updateCompanyStatus,
} from "../controllers/admin.controller.js";
import { authMiddleware } from "../middleware/auth.js";
import { enforceDataIsolation } from "../middleware/dataIsolation.js";

const router = Router();

// All admin routes require authentication
router.use(authMiddleware);

// GET /api/admin/dashboard
router.get("/dashboard", getDashboard);

// ============= COMPANY MANAGEMENT =============
// Note: Company routes do NOT use enforceDataIsolation
// because Super Admin needs to access all companies

/**
 * POST /api/admin/companies
 * Create a new company (Super Admin only)
 */
router.post("/companies", createCompany);

/**
 * GET /api/admin/companies
 * Get all companies (Super Admin only)
 */
router.get("/companies", getCompanies);

/**
 * GET /api/admin/companies/:id
 * Get company by ID (Super Admin only)
 */
router.get("/companies/:id", getCompanyById);

/**
 * PUT /api/admin/companies/:id
 * Update company (Super Admin only)
 */
router.put("/companies/:id", updateCompany);

/**
 * PATCH /api/admin/companies/:id/status
 * Update company status (Super Admin only)
 */
router.patch("/companies/:id/status", updateCompanyStatus);

export default router;
