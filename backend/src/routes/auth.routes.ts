import { Router } from "express";
import { register, login, updateBusiness, updateBank, updateTax, getMe, forgotPassword, resetPassword, verifyEmail } from "../controllers/auth.controller.js";
import { authMiddleware } from "../middleware/auth.js";
import User from "../models/User.js";

const router = Router();

// Public routes
router.post("/register", register);
router.post("/login", login);
router.get("/verify-email/:token", verifyEmail);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password/:token", resetPassword);

// DEBUG endpoint - check user verification status by email
router.get("/debug/check/:email", async (req, res) => {
  try {
    const user = await User.findOne({ email: req.params.email });
    if (!user) {
      res.json({ message: "User not found", email: req.params.email });
      return;
    }
    
    res.json({
      email: user.email,
      firstName: user.firstName,
      isVerified: user.isVerified,
      isEmailVerified: user.isEmailVerified || user.isVerified,
      isFirstLogin: user.isFirstLogin,
      isModuleAssigned: user.isModuleAssigned !== false,
      hasVerificationToken: !!user.verificationToken,
      verificationTokenLength: user.verificationToken?.length || 0,
      verificationTokenPreview: user.verificationToken ? user.verificationToken.substring(0, 10) + "..." : "none",
      verificationTokenExpiry: user.verificationTokenExpire,
      isTokenExpired: user.verificationTokenExpire ? new Date() > user.verificationTokenExpire : "N/A",
      createdAt: user.createdAt,
    });
  } catch (error) {
    res.status(500).json({ message: "Error checking user", error: String(error) });
  }
});

// DEBUG endpoint - manually verify a user (only for testing)
router.post("/debug/verify/:email", async (req, res) => {
  try {
    const user = await User.findOne({ email: req.params.email });
    if (!user) {
      res.status(404).json({ message: "User not found" });
      return;
    }
    
    const wasVerified = user.isVerified;
    user.isVerified = true;
    user.isEmailVerified = true;
    user.verificationToken = undefined;
    user.verificationTokenExpire = undefined;
    await user.save();
    
    res.json({ 
      message: "User manually verified",
      email: user.email,
      wasVerified,
      nowVerified: user.isVerified
    });
  } catch (error) {
    res.status(500).json({ message: "Error verifying user", error: String(error) });
  }
});

// Protected routes (require JWT)
router.get("/me", authMiddleware, getMe);
router.put("/onboarding/business", authMiddleware, updateBusiness);
router.put("/onboarding/bank", authMiddleware, updateBank);
router.put("/onboarding/tax", authMiddleware, updateTax);

export default router;
