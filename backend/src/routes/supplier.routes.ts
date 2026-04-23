import { Router } from "express";
import {
  createSupplier,
  getSuppliers,
  getSupplierById,
  updateSupplier,
  deleteSupplier,
} from "../controllers/supplier.controller.js";
import { authMiddleware } from "../middleware/auth.js";
import { enforceDataIsolation } from "../middleware/dataIsolation.js";
import { checkPermission } from "../middleware/permission.middleware.js";

const router = Router();

/**
 * All routes require authentication and company data isolation
 */
router.use(authMiddleware);
router.use(enforceDataIsolation);

/**
 * POST /api/suppliers
 * Create a new supplier
 * Permission: Create
 */
router.post("/", checkPermission("supplier", "create"), createSupplier);

/**
 * GET /api/suppliers
 * Get all suppliers for current company
 * Permission: View
 */
router.get("/", checkPermission("supplier", "view"), getSuppliers);

/**
 * GET /api/suppliers/:id
 * Get supplier by ID
 * Permission: View
 */
router.get("/:id", checkPermission("supplier", "view"), getSupplierById);

/**
 * PUT /api/suppliers/:id
 * Update supplier
 * Permission: Update
 */
router.put("/:id", checkPermission("supplier", "update"), updateSupplier);

/**
 * DELETE /api/suppliers/:id
 * Delete supplier (soft delete)
 * Permission: Delete
 */
router.delete("/:id", checkPermission("supplier", "delete"), deleteSupplier);

export default router;
