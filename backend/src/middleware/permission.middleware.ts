import { Request, Response, NextFunction } from "express";
import User from "../models/User.js";
import { USER_ROLES } from "../constants/user.constants.js";

/**
 * Permission middleware to check if user has required permissions
 * Admin users bypass all checks
 * @param module - The module name (e.g., "product", "user", "supplier")
 * @param action - The action (e.g., "view", "create", "update", "delete")
 */
export const checkPermission = (module: string, action: string) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      console.log(`[checkPermission] Checking ${action} permission on module: ${module}`);
      if (!req.userId) {
        console.log(`[checkPermission] No user ID in request`);
        res.status(401).json({ message: "Authentication required" });
        return;
      }

      const user = await User.findById(req.userId);
      if (!user) {
        console.log(`[checkPermission] User not found for id: ${req.userId}`);
        res.status(401).json({ message: "User not found" });
        return;
      }

      console.log(`[checkPermission] User found:`, { id: user._id, role: user.role, email: user.email });

      // Super admins and company admins bypass permission checks.
      if (user.role === USER_ROLES.SUPER_ADMIN || user.role === USER_ROLES.ADMIN) {
        console.log(`[checkPermission] Elevated user - bypassing permission check`);
        (req as any).user = user;
        next();
        return;
      }

      // Check staff permissions
      const hasPermission = (user.permissions as any)?.[module]?.[action];
      console.log(`[checkPermission] Staff user ${action} permission on ${module}:`, hasPermission);
      if (!hasPermission) {
        console.log(`[checkPermission] Permission denied for user:`, { module, action, email: user.email });
        res.status(403).json({
          message: `You don't have permission to ${action} ${module}`,
        });
        return;
      }

      console.log(`[checkPermission] Permission granted`);
      (req as any).user = user;
      next();
    } catch (error) {
      console.error("[checkPermission] Error:", error);
      res.status(500).json({ message: "Permission check failed" });
    }
  };
};

/**
 * Middleware to require admin role
 */
export const requireAdmin = async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.userId) {
      res.status(401).json({ message: "Authentication required" });
      return;
    }

    const user = await User.findById(req.userId);
    if (!user) {
      res.status(401).json({ message: "User not found" });
      return;
    }

    if (user.role !== USER_ROLES.ADMIN && user.role !== USER_ROLES.SUPER_ADMIN) {
      res.status(403).json({ message: "Admin access required" });
      return;
    }

    (req as any).user = user;
    next();
  } catch (error) {
    console.error("Admin check error:", error);
    res.status(500).json({ message: "Admin check failed" });
  }
};
