import { Router } from "express";
import { authMiddleware } from "../middleware/auth.js";
import { enforceDataIsolation } from "../middleware/dataIsolation.js";
import { trialRestrictions } from "../middleware/trial.js";
import {
  listUsers,
  listUsersGrouped,
  getUserById,
  createUser,
  updateUser,
  toggleUserStatus,
  deleteUser,
  changePassword,
} from "../controllers/user.controller.js";
import { checkPermission } from "../middleware/permission.middleware.js";

const router = Router();

// All user routes require authentication
router.use(authMiddleware);
router.use(enforceDataIsolation);
router.use(trialRestrictions);

/**
 * @swagger
 * /api/users:
 *   get:
 *     summary: Get all users (admin only)
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Success
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 */
router.get("/", checkPermission("user", "view"), listUsers);

router.get("/grouped", checkPermission("user", "view"), listUsersGrouped);

/**
 * @swagger
 * /api/users/:id:
 *   get:
 *     summary: Get user details by ID (admin only)
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Success
 *       404:
 *         description: User not found
 */
router.get("/:id", checkPermission("user", "view"), getUserById);

/**
 * @swagger
 * /api/users:
 *   post:
 *     summary: Create a new user (admin only)
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               firstName:
 *                 type: string
 *               lastName:
 *                 type: string
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *               role:
 *                 type: string
 *                 enum: [admin, staff]
 *               permissions:
 *                 type: object
 *     responses:
 *       201:
 *         description: User created successfully
 *       400:
 *         description: Bad request
 */
router.post("/", checkPermission("user", "create"), createUser);

/**
 * @swagger
 * /api/users/:id:
 *   put:
 *     summary: Update user details (admin only)
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User updated successfully
 *       404:
 *         description: User not found
 */
router.put("/:id", checkPermission("user", "update"), updateUser);

router.patch("/:id/status", checkPermission("user", "update"), toggleUserStatus);

/**
 * @swagger
 * /api/users/:id:
 *   delete:
 *     summary: Delete a user (admin only)
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User deleted successfully
 *       404:
 *         description: User not found
 */
router.delete("/:id", checkPermission("user", "delete"), deleteUser);

/**
 * @swagger
 * /api/users/:id/password:
 *   put:
 *     summary: Change user password
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Password changed successfully
 *       401:
 *         description: Unauthorized
 */
router.put("/:id/password", changePassword);

export default router;
