import express from "express";
import {
  createPurchase,
  getPurchases,
  getPurchaseById,
  updatePurchase,
  deletePurchase,
} from "../controllers/purchase.controller.js";
import { authMiddleware } from "../middleware/auth.js";
import { enforceDataIsolation } from "../middleware/dataIsolation.js";
import { checkPermission } from "../middleware/permission.middleware.js";

const router = express.Router();

/**
 * All routes require authentication and company data isolation
 */
router.use(authMiddleware);
router.use(enforceDataIsolation);

/**
 * Purchase Routes
 * All routes require authentication and company context via middleware
 */

// List purchases
router.get("/", checkPermission("purchase", "view"), getPurchases);

// Create purchase
router.post("/", checkPermission("purchase", "create"), createPurchase);

// Get purchase by ID
router.get("/:id", checkPermission("purchase", "view"), getPurchaseById);

// Update purchase
router.put("/:id", checkPermission("purchase", "edit"), updatePurchase);

// Delete purchase
router.delete("/:id", checkPermission("purchase", "delete"), deletePurchase);

export default router;
