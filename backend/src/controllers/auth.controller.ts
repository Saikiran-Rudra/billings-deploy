import { Request, Response } from "express";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import User, { IUser } from "../models/User.js";
import Company from "../models/Company.js";
import sendEmail from "../utils/send-email.js";
import "dotenv/config";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const generateToken = (userData: {
  id: string;
  companyId?: string;
  role?: string;
  permissions?: any;
}) => {
  if(!process.env.JWT_SECRET) {
    console.log(".env JWT_SECRET is not set",process.env.JWT_SECRET);
    return;
  }
  return jwt.sign(
    {
      id: userData.id,
      companyId: userData.companyId,
      role: userData.role,
      permissions: userData.permissions,
    },
    process.env.JWT_SECRET,
    {
      expiresIn: "7d",
    }
  );
};

const formatUserResponse = (user: IUser) => {
  let companyIdStr: string | undefined = undefined;
  
  if (user.companyId) {
    // If it's a populated object with _id property
    if (typeof user.companyId === 'object' && '_id' in user.companyId) {
      companyIdStr = (user.companyId as any)._id.toString();
    } else {
      // If it's just an ObjectId
      companyIdStr = (user.companyId as any).toString();
    }
  }
  
  return {
    id: user._id,
    firstName: user.firstName,
    lastName: user.lastName,
    email: user.email,
    role: user.role,
    companyId: companyIdStr,
    permissions: user.permissions,
    isActive: user.isActive,
    isVerified: user.isVerified,
    isEmailVerified: user.isEmailVerified || user.isVerified,
    isFirstLogin: user.isFirstLogin,
    isModuleAssigned: user.isModuleAssigned !== false,
    onboardingCompleted: user.onboarding?.completed || false,
  };
};

// POST /api/auth/register
export const register = async (req: Request, res: Response) => {
  try {
    const { firstName, lastName, email, password, companyName } = req.body;

    if (!firstName || !lastName || !email || !password) {
      res.status(400).json({ message: "All fields are required" });
      return;
    }

    if (!EMAIL_REGEX.test(email)) {
      res.status(400).json({ message: "Invalid email format" });
      return;
    }

    if (password.length < 6) {
      res.status(400).json({ message: "Password must be at least 6 characters" });
      return;
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      res.status(400).json({ message: "User already exists with this email" });
      return;
    }

    // Create user as admin (will own a new company)
    const user = new User({
      firstName,
      lastName,
      email,
      password,
      role: "admin", // First user of a company is admin
      isActive: true,
      isVerified: false, // EXPLICITLY set to false - email verification required
      isEmailVerified: false,
      isFirstLogin: false,
      isModuleAssigned: true,
    });

    console.log("📧 Register - Created user object (not saved yet)");
    console.log("📧 Register - isVerified BEFORE token generation:", user.isVerified);

    // Generate verification token BEFORE saving
    const verificationToken = user.generateVerificationToken();
    
    console.log("📧 Register - Token generated successfully");
    console.log("📧 Register - Plain token (first 20 chars):", verificationToken.substring(0, 20));
    console.log("📧 Register - Stored hash (first 20 chars):", user.verificationToken?.substring(0, 20));
    console.log("📧 Register - Token expiry will be:", user.verificationTokenExpire);
    console.log("📧 Register - isVerified AFTER token generation:", user.isVerified);

    // NOW save the user with token
    await user.save();
    
    console.log("📧 Register - User saved to database");

    // Verify it was saved correctly
    const savedUser = await User.findById(user._id);
    console.log("📧 Register - VERIFICATION CHECK:");
    console.log("  - isVerified:", savedUser?.isVerified);
    console.log("  - verificationToken exists:", !!savedUser?.verificationToken);
    console.log("  - verificationTokenExpire:", savedUser?.verificationTokenExpire);

    // Create company for this user
    const company = await Company.create({
      name: companyName || `${firstName} ${lastName}'s Company`,
      ownerId: user._id,
      ownerEmail: email,
      modules: ["sales", "inventory", "accounting"],
      status: "active",
      isActive: true,
      plan: "trial", // Default to trial
    });

    console.log("📧 Register - Company created:", company._id);

    // Update user with company reference
    user.companyId = company._id;
    await user.save();

    // Send verification email
    const frontendUrl = process.env.FRONTEND_URL || "http://localhost:3000";
    const verificationUrl = `${frontendUrl}/verify-email/${verificationToken}`;
    const emailTemplate = `
      <h2>Welcome to Hisaab Kitaab!</h2>
      <p>Hi ${firstName},</p>
      <p>Please verify your email address by clicking the link below:</p>
      <a href="${verificationUrl}" style="display: inline-block; padding: 10px 20px; background: #3b82f6; color: white; text-decoration: none; border-radius: 5px;">
        Verify Email Address
      </a>
      <p>This link will expire in 24 hours.</p>
      <p>If you didn't create this account, please ignore this email.</p>
    `;

    try {
      await sendEmail({
        to: email,
        subject: "Verify your email address",
        html: emailTemplate,
      });
      console.log("📧 Register - Verification email sent to:", email);
    } catch (emailError) {
      console.error("Failed to send verification email:", emailError);
      // Continue despite email failure - user can request new verification
    }

    res.status(201).json({
      message: "Registration successful. Please check your email to verify your account.",
      requiresEmailVerification: true,
      email: user.email,
      user: formatUserResponse(user),
      company: {
        id: company._id.toString(),
        name: company.name,
        plan: company.plan,
        trialStart: company.trialStart,
        trialEnd: company.trialEnd,
        trialEnded: company.trialEnded,
      },
    });
  } catch (error) {
    console.error("Register error:", error);
    res.status(500).json({ message: "Server error during registration" });
  }
};

// POST /api/auth/login
export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      res.status(400).json({ message: "Email and password are required" });
      return;
    }

    const user = await User.findOne({ email }).populate("companyId");
    if (!user) {
      res.status(401).json({ message: "Invalid email or password" });
      return;
    }

    // 🔐 SECURITY: Check if user is active BEFORE password validation
    // This prevents disabled users from accessing the system
    if (!user.isActive) {
      console.log(`[LOGIN BLOCKED] ❌ Disabled user attempt to login: ${email}`);
      res.status(403).json({ 
        message: "Your account has been disabled. Contact your administrator.",
        code: "ACCOUNT_DISABLED" 
      });
      return;
    }

    const company = typeof user.companyId === 'object' && '_id' in user.companyId 
      ? (user.companyId as any)
      : null;

    if (company?.status === "inactive") {
      res.status(403).json({
        message: "Company is inactive. Contact support.",
        code: "COMPANY_INACTIVE",
      });
      return;
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      res.status(401).json({ message: "Invalid email or password" });
      return;
    }

    // Check if email is verified
    console.log("🔑 Login - Email:", user.email);
    console.log("🔑 Login - Is verified:", user.isVerified);
    console.log("🔑 Login - Verification token:", user.verificationToken?.substring(0, 10) + "..." || "none");
    console.log("🔑 Login - Token expiry:", user.verificationTokenExpire);
    
    const emailVerified = user.isVerified || user.isEmailVerified;
    if (!emailVerified) {
      console.log("🔑 Login - User not verified, returning emailNotVerified error");
      res.status(403).json({ 
        message: "Please verify your email to continue.",
        emailNotVerified: true,
        email: user.email
      });
      return;
    }

    if (user.isModuleAssigned === false) {
      res.status(403).json({
        message: "Your account is not fully set up yet. Please contact your company admin.",
        moduleNotAssigned: true,
        code: "MODULE_NOT_ASSIGNED",
      });
      return;
    }

    console.log("🔑 Login - User verified, issuing JWT token");

    const token = generateToken({
      id: user._id.toString(),
      companyId: user.companyId?._id?.toString(),
      role: user.role,
      permissions: user.permissions,
    });

    res.json({
      message: "Login successful",
      token,
      user: formatUserResponse(user),
      firstLoginRequired: user.isFirstLogin,
      company: user.companyId ? {
        id: typeof user.companyId === 'object' && '_id' in user.companyId 
          ? (user.companyId as any)._id.toString()
          : (user.companyId as any).toString(),
        name: typeof user.companyId === 'object' && 'name' in user.companyId
          ? (user.companyId as any).name
          : undefined,
        plan: company?.plan,
        trialEnd: company?.trialEnd,
        isTrialActive: company?.isTrialActive?.(),
        remainingTrialDays: company?.getRemainingTrialDays?.(),
      } : null,
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ message: "Server error during login" });
  }
};

// GET /api/auth/verify-email/:token (NEW)
export const verifyEmail = async (req: Request, res: Response) => {
  try {
    const token = req.params.token as string;

    if (!token) {
      console.log("❌ Verify Email - No token provided in request");
      res.status(400).json({ 
        message: "Invalid verification token" 
      });
      return;
    }

    console.log("\n🔐 ===== VERIFICATION ATTEMPT =====");
    console.log("🔐 Received token (first 20 chars):", token.substring(0, 20));
    console.log("🔐 Received token length:", token.length);
    
    const verificationTokenHash = crypto
      .createHash("sha256")
      .update(token)
      .digest("hex");

    console.log("🔐 Hashed token (first 20 chars):", verificationTokenHash.substring(0, 20));
    console.log("🔐 Hashed token length:", verificationTokenHash.length);
    
    // First, check if any user has this exact token (unhashed) - suggests double-hashing issue
    const unhashedTokenMatch = await User.findOne({
      verificationToken: token, // Try exact match first
    });
    
    if (unhashedTokenMatch) {
      console.log("⚠️  WARNING: Found user with unhashed token stored! Email:", unhashedTokenMatch.email);
      console.log("   This suggests double-hashing issue. Fixing user record...");
      unhashedTokenMatch.isVerified = true;
      unhashedTokenMatch.isEmailVerified = true;
      unhashedTokenMatch.verificationToken = undefined;
      unhashedTokenMatch.verificationTokenExpire = undefined;
      await unhashedTokenMatch.save();
      res.json({ 
        message: "Email verified successfully (fixed double-hashing issue)",
        verified: true 
      });
      return;
    }

    // Normal flow: look for hashed token
    const userWithValidToken = await User.findOne({
      verificationToken: verificationTokenHash,
      verificationTokenExpire: { $gt: new Date() },
    });

    if (userWithValidToken) {
      console.log("✅ Token match found! Email:", userWithValidToken.email);
      console.log("✅ Token expires at:", userWithValidToken.verificationTokenExpire);
      
      userWithValidToken.isVerified = true;
      userWithValidToken.isEmailVerified = true;
      userWithValidToken.verificationToken = undefined;
      userWithValidToken.verificationTokenExpire = undefined;
      await userWithValidToken.save();

      console.log("✅ User marked as verified successfully");
      res.json({ 
        message: "Email verified successfully. You can now login.",
        verified: true 
      });
      return;
    }

    // Debug: check if user exists with this token but expired
    const expiredTokenUser = await User.findOne({
      verificationToken: verificationTokenHash,
    });
    
    if (expiredTokenUser) {
      console.log("⏰ Token expired for user:", expiredTokenUser.email);
      console.log("⏰ Token was supposed to expire at:", expiredTokenUser.verificationTokenExpire);
      console.log("⏰ Current time:", new Date());
      res.status(400).json({ 
        message: "Verification token has expired. Please request a new verification email.",
        tokenExpired: true
      });
      return;
    }

    // No match at all
    console.log("❌ No user found with this token");
    console.log("❌ Searching all users to understand the system state...");
    
    const allUsersCount = await User.countDocuments({});
    const unverifiedCount = await User.countDocuments({ isVerified: false });
    const verifiedCount = await User.countDocuments({ isVerified: true });
    const withTokenCount = await User.countDocuments({ verificationToken: { $exists: true, $ne: null } });
    
    console.log("❌ Database stats:", { allUsersCount, unverifiedCount, verifiedCount, withTokenCount });

    res.status(400).json({ 
      message: "Invalid verification token - no matching user found"
    });
  } catch (error) {
    console.error("❌ Email verification error:", error);
    res.status(500).json({ 
      message: "Server error during email verification" 
    });
  }
};

// GET /api/auth/me
export const getMe = async (req: Request, res: Response) => {
  try {
    const user = req.user;
    if (!user) {
      res.status(401).json({ message: "Not authenticated" });
      return;
    }

    const populatedUser = await User.findById(user._id).populate("companyId");
if(!populatedUser) {
      res.status(404).json({ message: "User not found" });
      return;
    }

    // Get company info for trial status
    const company = typeof populatedUser.companyId === 'object' && '_id' in populatedUser.companyId 
      ? (populatedUser.companyId as any)
      : null;

    res.json({
      user: formatUserResponse(populatedUser),
      company: populatedUser.companyId
        ? {
            id: typeof populatedUser.companyId === 'object' && '_id' in populatedUser.companyId
              ? (populatedUser.companyId as any)._id.toString()
              : (populatedUser.companyId as any).toString(),
            name: typeof populatedUser.companyId === 'object' && 'name' in populatedUser.companyId
              ? (populatedUser.companyId as any).name
              : undefined,
            plan: company?.plan,
            trialStart: company?.trialStart,
            trialEnd: company?.trialEnd,
            trialEnded: company?.trialEnded,
            isTrialActive: company?.isTrialActive?.(),
            remainingTrialDays: company?.getRemainingTrialDays?.(),
          }
        : null,
    });
  } catch (error) {
    console.error("Get current user error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// PUT /api/auth/onboarding/business
export const updateBusiness = async (req: Request, res: Response) => {
  try {
    const user = req.user;
    if (!user) {
      res.status(401).json({ message: "Not authenticated" });
      return;
    }

    const { businessName, businessType, industry, businessAddress } = req.body;

    // Update User onboarding
    const updatedUser = await User.findByIdAndUpdate(
      user._id,
      {
        "onboarding.business": { businessName, businessType, industry, businessAddress },
      },
      { new: true }
    );

    if (!updatedUser) {
      res.status(404).json({ message: "User not found" });
      return;
    }

    // Also update Company businessInfo (NEW)
    if (user.companyId) {
      await Company.findByIdAndUpdate(
        user.companyId,
        {
          "businessInfo": { businessName, businessType, industry, businessAddress },
        },
        { new: true }
      );
    }

    res.json({ message: "Business info saved", user: { id: updatedUser._id, onboarding: updatedUser.onboarding } });
  } catch (error) {
    console.error("Update business error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// PUT /api/auth/onboarding/bank
export const updateBank = async (req: Request, res: Response) => {
  try {
    const user = req.user;
    if (!user) {
      res.status(401).json({ message: "Not authenticated" });
      return;
    }

    const { bankName, accountNumber, ifscCode, branchName } = req.body;

    // Update User onboarding
    const updatedUser = await User.findByIdAndUpdate(
      user._id,
      {
        "onboarding.bank": { bankName, accountNumber, ifscCode, branchName },
      },
      { new: true }
    );

    if (!updatedUser) {
      res.status(404).json({ message: "User not found" });
      return;
    }

    // Also update Company bankInfo (NEW)
    if (user.companyId) {
      await Company.findByIdAndUpdate(
        user.companyId,
        {
          "bankInfo": { bankName, accountNumber, ifscCode, branchName },
        },
        { new: true }
      );
    }

    res.json({ message: "Bank info saved", user: { id: updatedUser._id, onboarding: updatedUser.onboarding } });
  } catch (error) {
    console.error("Update bank error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// PUT /api/auth/onboarding/tax
export const updateTax = async (req: Request, res: Response) => {
  try {
    const user = req.user;
    if (!user) {
      res.status(401).json({ message: "Not authenticated" });
      return;
    }

    const { gstRegistration, gstin, panNumber, financialYearStart } = req.body;

    // Update User onboarding
    const updatedUser = await User.findByIdAndUpdate(
      user._id,
      {
        "onboarding.tax": { gstRegistration, gstin, panNumber, financialYearStart },
        "onboarding.completed": true,
      },
      { new: true }
    );

    if (!updatedUser) {
      res.status(404).json({ message: "User not found" });
      return;
    }

    // Also update Company taxInfo (NEW)
    if (user.companyId) {
      await Company.findByIdAndUpdate(
        user.companyId,
        {
          "taxInfo": { gstRegistration, gstin, panNumber, financialYearStart },
        },
        { new: true }
      );
    }

    res.json({ message: "Tax info saved, onboarding complete", user: { id: updatedUser._id, onboarding: updatedUser.onboarding } });
  } catch (error) {
    console.error("Update tax error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

const CLIENT_URL = process.env.CLIENT_URL || "http://localhost:3000";

// POST /api/auth/forgot-password
export const forgotPassword = async (req: Request, res: Response) => {
  try {
    const { email } = req.body;

    if (!email || !EMAIL_REGEX.test(email)) {
      res.status(400).json({ message: "Please provide a valid email address" });
      return;
    }

    const user = await User.findOne({ email });

    // Always return success to prevent user enumeration
    if (!user) {
      res.json({ message: "If an account with that email exists, a password reset link has been sent" });
      return;
    }

    const resetToken = user.generateResetToken();
    await user.save({ validateBeforeSave: false });

    const resetUrl = `${CLIENT_URL}/reset-password/${resetToken}`;

    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #1e3a5f;">Password Reset Request</h2>
        <p>Hi ${user.firstName},</p>
        <p>You requested a password reset for your Hisab Kitab account.</p>
        <p>Click the button below to reset your password. This link is valid for <strong>15 minutes</strong>.</p>
        <a href="${resetUrl}" style="display: inline-block; background-color: #1e3a5f; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; margin: 16px 0;">Reset Password</a>
        <p style="color: #666; font-size: 14px;">If you didn't request this, you can safely ignore this email.</p>
        <hr style="border: none; border-top: 1px solid #eee; margin: 24px 0;" />
        <p style="color: #999; font-size: 12px;">Hisab Kitab &mdash; Accounting made simple</p>
      </div>
    `;

    try {
      await sendEmail({
        to: user.email,
        subject: "Password Reset - Hisab Kitab",
        html,
      });

      res.json({ message: "If an account with that email exists, a password reset link has been sent" });
    } catch (emailError) {
      // Rollback token if email fails
      user.resetPasswordToken = undefined;
      user.resetPasswordExpire = undefined;
      await user.save({ validateBeforeSave: false });

      console.error("Email send error:", emailError);
      res.status(500).json({ message: "Failed to send reset email. Please try again later." });
    }
  } catch (error) {
    console.error("Forgot password error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// POST /api/auth/reset-password/:token
export const resetPassword = async (req: Request, res: Response) => {
  try {
    const { token } = req.params;
    const { password } = req.body;

    if (!token || typeof token !== "string") {
      res.status(400).json({ message: "Invalid reset token" });
      return;
    }

    if (!password || password.length < 6) {
      res.status(400).json({ message: "Password must be at least 6 characters" });
      return;
    }

    // Hash the incoming token to compare with stored hash
    const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

    const user = await User.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpire: { $gt: new Date() },
    });

    if (!user) {
      res.status(400).json({ message: "Invalid or expired reset token" });
      return;
    }

    // Update password and clear reset fields
    user.password = password;
    user.isFirstLogin = false;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save();

    res.json({ message: "Password has been reset successfully" });
  } catch (error) {
    console.error("Reset password error:", error);
    res.status(500).json({ message: "Server error" });
  }
};
