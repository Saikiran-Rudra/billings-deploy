import { Router } from "express";
import { authMiddleware } from "../middleware/auth.js";
import { enforceDataIsolation } from "../middleware/dataIsolation.js";
import {
  createSalesReturn,
  getSalesReturns,
  getSalesReturnById,
  updateSalesReturn,
  deleteSalesReturn,
} from "../controllers/salesReturn.controller.js";

const router = Router();


/**
 * @swagger
 * /api/salesReturns:
 *   get:
 *     summary: Get all sales returns
 *     tags: [SalesReturns]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Success
 */


router.use(authMiddleware);
router.use(enforceDataIsolation);

router.post("/", createSalesReturn);
router.get("/", getSalesReturns);
router.get("/:id", getSalesReturnById);
router.put("/:id", updateSalesReturn);
router.delete("/:id", deleteSalesReturn);

export default router;
