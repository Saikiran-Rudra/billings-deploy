import { Request, Response, NextFunction } from "express";
import Company from "../models/Company.js";
import { USER_ROLES } from "../constants/user.constants.js";

/**
 * Middleware to enforce trial restrictions
 * Blocks restricted operations during trial period
 */
export const trialRestrictions = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const user = (req as any).user;
    if (!user) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    if (user.role === USER_ROLES.SUPER_ADMIN) {
      next();
      return;
    }

    if (!user.companyId) {
      return res.status(400).json({ message: "Company not found" });
    }

    // Get company to check trial status
    const company = await Company.findById(user.companyId);
    if (!company) {
      return res.status(400).json({ message: "Company not found" });
    }

    // Check if company is in trial
    if (company.isTrialActive()) {
      // Block certain endpoints during trial
      const restrictedPaths = [
        "/api/users", // Block user creation
      ];

      const currentPath = req.path;
      const isRestricted = restrictedPaths.some(
        (path) => currentPath.startsWith(path)
      );

      if (isRestricted && req.method === "POST") {
        return res.status(403).json({
          message:
            "This feature is not available during trial period. Please upgrade your plan.",
          trialRestricted: true,
          featureName: "User Creation",
          trialEndsAt: company.trialEnd,
          remainingDays: company.getRemainingTrialDays(),
        });
      }
    }

    // Attach company to request for downstream use
    (req as any).company = company;
    next();
  } catch (error) {
    console.error("Trial restrictions middleware error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

export default trialRestrictions;
