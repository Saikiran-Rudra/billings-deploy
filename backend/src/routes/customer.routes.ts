import { Router } from "express";
import { authMiddleware } from "../middleware/auth.js";
import { enforceDataIsolation } from "../middleware/dataIsolation.js";
import {
  createCustomer,
  getCustomers,
  getCustomerById,
  updateCustomer,
  deleteCustomer,
} from "../controllers/customer.controller.js";

const router = Router();

/**
 * @swagger
 * /api/customers:
 *   get:
 *     summary: Get all customers
 *     tags: [Customers]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Success
 */

router.use(authMiddleware);
router.use(enforceDataIsolation);

router.post("/", createCustomer);
router.get("/", getCustomers);
router.get("/:id", getCustomerById);
router.put("/:id", updateCustomer);
router.delete("/:id", deleteCustomer);

export default router;
