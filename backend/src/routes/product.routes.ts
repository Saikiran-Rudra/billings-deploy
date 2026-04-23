import { Router } from "express";
import { authMiddleware } from "../middleware/auth.js";
import { enforceDataIsolation } from "../middleware/dataIsolation.js";
import { checkPermission } from "../middleware/permission.middleware.js";
import {
  generateSKU,
  getNextSKU,
  createProduct,
  getProducts,
  getProductById,
  updateProduct,
  deleteProduct,
} from "../controllers/product.controller.js";

const router = Router();


/**
 * @swagger
 * /api/products:
 *   get:
 *     summary: Get all products
 *     tags: [Products]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Success
 */


// All product routes require authentication
router.use(authMiddleware);
router.use(enforceDataIsolation);

// Apply permission checks for each action
router.post("/generate-sku", checkPermission("product", "create"), generateSKU);
router.get("/next-sku", checkPermission("product", "create"), getNextSKU);
router.post("/", checkPermission("product", "create"), createProduct);
router.get("/", checkPermission("product", "view"), getProducts);
router.get("/:id", checkPermission("product", "view"), getProductById);
router.put("/:id", checkPermission("product", "update"), updateProduct);
router.delete("/:id", checkPermission("product", "delete"), deleteProduct);

export default router;
