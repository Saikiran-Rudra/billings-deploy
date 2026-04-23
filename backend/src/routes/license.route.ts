import { Router } from "express";

import { authMiddleware } from "../middleware/auth.js";
import { enforceDataIsolation } from "../middleware/dataIsolation.js";
import { checkLicense } from "../middleware/checkLicense.js";

import {
  createLicenseController,
  getLicensesController,
  assignLicenseController,
  getCompanyPlanController
} from "../controllers/license.controller.js";

const router = Router();

/**
 * 🔐 Global Middlewares
 */
router.use(authMiddleware);

/**
 * ⚠️ IMPORTANT:
 * License module should NOT be blocked by license middleware
 * otherwise expired users can't upgrade
 */

// Optional: only apply data isolation where needed
router.use(enforceDataIsolation);

/**
 * 🧾 License Master (Super Admin)
 */
router.post("/", createLicenseController);
router.get("/", getLicensesController);

/**
 * 🔗 Assign / Change Company Plan
 */
router.post("/assign", assignLicenseController);

/**
 * 📊 Get Company Current Plan
 */
router.get("/company/:companyId", getCompanyPlanController);

export default router;