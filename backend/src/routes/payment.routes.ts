import { Router } from "express";
import { authMiddleware } from "../middleware/auth.js";
import { enforceDataIsolation } from "../middleware/dataIsolation.js";
import {
  createPayment,
  getPayments,
  getPaymentById,
  updatePayment,
  deletePayment,
} from "../controllers/payment.controller.js";

const router = Router();


/**
 * @swagger
 * /api/payments:
 *   get:
 *     summary: Get all payments
 *     tags: [Payments]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Success
 */


router.use(authMiddleware);
router.use(enforceDataIsolation);

router.post("/", createPayment);
router.get("/", getPayments);
router.get("/:id", getPaymentById);
router.put("/:id", updatePayment);
router.delete("/:id", deletePayment);

export default router;
