import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import "dotenv/config";
import User, { IUser } from "../models/User.js";
import Company from "../models/Company.js";

const JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET) {
  throw new Error("JWT_SECRET environment variable is not defined");
}

interface JWTPayload {
  id: string;
  companyId?: string;
  role?: string;
  permissions?: any;
}

export const authMiddleware = async (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;
  console.log(`[authMiddleware] Authorization header present:`, !!authHeader);

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    console.log(`[authMiddleware] Missing or invalid authorization header`);
    res.status(401).json({ message: "Authentication required" });
    return;
  }

  try {
    const token = authHeader.split(" ")[1];
    console.log(`[authMiddleware] Verifying token...`);
    const decoded = jwt.verify(token, JWT_SECRET) as JWTPayload;
    console.log(`[authMiddleware] Token verified for user id:`, decoded.id);

    // Fetch full user object
    const user = await User.findById(decoded.id);
    
    if (!user) {
      console.log(`[authMiddleware] User not found:`, decoded.id);
      res.status(401).json({ message: "User not found" });
      return;
    }

    // 🔐 SECURITY: Validate user is still active on EVERY request
    // This prevents disabled users from accessing the API even with valid tokens
    if (!user.isActive) {
      console.log(`[authMiddleware] ❌ SECURITY BLOCK: Disabled user attempted API access:`, decoded.id, user.email);
      res.status(403).json({ 
        message: "Your account has been disabled. You have been logged out.",
        code: "ACCOUNT_DISABLED",
        logout: true
      });
      return;
    }

    if (user.companyId) {
      const company = await Company.findById(user.companyId).select("status");
      if (company?.status === "inactive") {
        res.status(403).json({
          message: "Company is inactive. Contact support.",
          code: "COMPANY_INACTIVE",
          logout: true,
        });
        return;
      }
    }

    // Maintain backward compatibility: also set req.userId
    req.userId = decoded.id;
    req.user = user;

    next();
  } catch (error) {
    console.error(`[authMiddleware] Token verification failed:`, error instanceof Error ? error.message : error);
    res.status(401).json({ message: "Invalid or expired token" });
  }
};
