import { Router } from "express";
import { authMiddleware } from "../middleware/auth.js";
import { enforceDataIsolation, captureAuditContext } from "../middleware/dataIsolation.js";
import {
  getAllCompanies,
  getCompany,
  getMyCompany,
  updateCompany,
  deleteCompany,
  toggleModule,
  getCompanyUsers,
  getCompanyUsersForMyCompany,
  inviteUserToCompany,
  removeUserFromCompany,
  disableUserInCompany,
  getSubscription,
  updateSubscription,
} from "../controllers/company.controller.js";
import { updateCompanyStatus } from "../controllers/admin.controller.js";

const router = Router();

// All routes require authentication and audit logging
router.use(authMiddleware);
router.use(captureAuditContext);

/**
 * Public company endpoints (authenticated users)
 */
// Get my company
router.get("/my-company", enforceDataIsolation, getMyCompany);

// Get users for my company
router.get("/users", enforceDataIsolation, getCompanyUsersForMyCompany);

// Invite user to my company
router.post("/users/invite", enforceDataIsolation, inviteUserToCompany);

// Remove user from my company
router.delete("/users/:userId", enforceDataIsolation, removeUserFromCompany);

// Disable/Update user in my company
router.put("/users/:userId", enforceDataIsolation, disableUserInCompany);

/**
 * SuperAdmin only endpoints
 */
// Get all companies
router.get("/", getAllCompanies);

// Toggle company status (SuperAdmin only)
router.patch("/:id/status", updateCompanyStatus);

/**
 * Company-specific endpoints (by ID)
 */
// Get company details
router.get("/:companyId", getCompany);

// Update company details
router.put("/:companyId", updateCompany);

// Delete (archive) company
router.delete("/:companyId", deleteCompany);

// Toggle module
router.patch("/:companyId/modules/:module", toggleModule);

// Get company users
router.get("/:companyId/users", getCompanyUsers);

// Get subscription details
router.get("/:companyId/subscription", getSubscription);

// Update subscription (SuperAdmin only)
router.put("/:companyId/subscription", updateSubscription);

export default router;
