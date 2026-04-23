import { Router } from "express";
import { authMiddleware } from "../middleware/auth.js";
import { enforceDataIsolation } from "../middleware/dataIsolation.js";
import {
    getExpensesController,
    getExpenseByIdController,
    createExpenseController,
    updateExpenseController,
    deleteExpenseController
} from "../controllers/expenses.controller.js";

const router = Router();

router.use(authMiddleware);
router.use(enforceDataIsolation);
router.get("/", getExpensesController);
router.get("/:id", getExpenseByIdController);
router.post("/", createExpenseController);
router.put("/:id", updateExpenseController);
router.delete("/:id", deleteExpenseController);

export default router;
