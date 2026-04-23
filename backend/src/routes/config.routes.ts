import { Router } from "express";
import { authMiddleware } from "../middleware/auth.js";
import {
  getProductConfig,
  updateProductConfig,
  addCategory,
  removeCategory,
  addUnit,
  removeUnit,
  updateGstRates,
  updateSkuSettings,
} from "../controllers/productConfig.controller.js";

const router = Router();

// All config routes require authentication
router.use(authMiddleware);

/**
 * @swagger
 * /api/config/products:
 *   get:
 *     summary: Get product configuration
 *     tags: [Product Config]
 *     security:
 *       - bearerAuth: []
 */
router.get("/", getProductConfig);

/**
 * @swagger
 * /api/config/products:
 *   put:
 *     summary: Update product configuration
 *     tags: [Product Config]
 *     security:
 *       - bearerAuth: []
 */
router.put("/", updateProductConfig);

/**
 * Categories
 */
router.post("/categories", addCategory);
router.delete("/categories/:category", removeCategory);

/**
 * Units
 */
router.post("/units", addUnit);
router.delete("/units/:unit", removeUnit);

/**
 * GST Rates
 */
router.put("/gst-rates", updateGstRates);

/**
 * SKU Settings
 */
router.put("/sku-settings", updateSkuSettings);

export default router;
