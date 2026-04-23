import { Request, Response, NextFunction } from "express";
import { IUser } from "../models/User.js";
import { USER_ROLES } from "../constants/user.constants.js";

/**
 * Data Isolation Middleware
 * Ensures users can only access data from their own company
 * SuperAdmins can access any company's data
 */
export const enforceDataIsolation = (req: Request, res: Response, next: NextFunction) => {
  const user = req.user as IUser & { companyId?: string };

  if (!user) {
    res.status(401).json({ message: "Authentication required" });
    return;
  }

  console.log("[enforceDataIsolation] User role:", user.role);
  console.log("[enforceDataIsolation] Is superadmin check:", user.role === USER_ROLES.SUPER_ADMIN);

  // SuperAdmins bypass data isolation
  if (user.role === USER_ROLES.SUPER_ADMIN) {
    (req as any).companyId = null;
    (req as any).isSuperAdmin = true;
    console.log("[enforceDataIsolation] SuperAdmin request - no company isolation");
    next();
    return;
  }

  // Regular users must have companyId
  if (!user.companyId) {
    res.status(403).json({ message: "Company context not set" });
    return;
  }

  // Attach companyId for use in controllers - ensure it's a string
  (req as any).companyId = String(user.companyId);
  (req as any).isSuperAdmin = false;
  
  console.log("[enforceDataIsolation] User isolation enforced", {
    userId: user._id,
    companyId: (req as any).companyId,
  });
  
  next();
};

/**
 * Activity Logging Middleware
 * Captures action details for audit trail
 */
export const captureAuditContext = (req: Request, res: Response, next: NextFunction) => {
  const user = req.user as IUser & { companyId?: string };
  
  (req as any).auditContext = {
    userId: user?._id,
    companyId: user?.companyId || null,
    ipAddress: req.ip || req.connection?.remoteAddress,
    userAgent: req.get("user-agent"),
    timestamp: new Date(),
  };
  
  next();
};

/**
 * Require Company ID Middleware
 * Validates that either companyId query param exists or user has companyId
 */
export const requireCompanyContext = (req: Request, res: Response, next: NextFunction) => {
  const user = req.user as IUser & { companyId?: string };
  const queryCompanyId = req.query.companyId as string;
  
  if (!user) {
    res.status(401).json({ message: "Authentication required" });
    return;
  }

  // SuperAdmins can view any company by passing companyId query param
  if (user.role === USER_ROLES.SUPER_ADMIN) {
    if (!queryCompanyId) {
      res.status(400).json({ message: "companyId query parameter required for superadmin" });
      return;
    }
    (req as any).companyId = queryCompanyId;
    next();
    return;
  }

  // Regular users must use their own company
  if (!user.companyId) {
    res.status(403).json({ message: "User not assigned to any company" });
    return;
  }

  (req as any).companyId = user.companyId.toString();
  next();
};
