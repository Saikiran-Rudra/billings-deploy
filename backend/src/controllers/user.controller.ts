import { Request, Response } from "express";
import User from "../models/User.js";
import { userService } from "../services/user.service.js";
import asyncHandler from "../utils/asyncHandler.js";
import AppError from "../utils/AppError.js";
import { UserRequestContext } from "../types/user.types.js";

const getUserContext = (req: Request): UserRequestContext => ({
  userId: req.userId,
  companyId: (req as Request & { companyId?: string | null }).companyId,
  isSuperAdmin: Boolean((req as Request & { isSuperAdmin?: boolean }).isSuperAdmin),
});

export const listUsers = asyncHandler(async (req: Request, res: Response) => {
  const result = await userService.listUsers(req.query, getUserContext(req));

  res.status(200).json({
    message: "Users retrieved successfully",
    data: result.data,
    ...(result.pagination ? { pagination: result.pagination } : {}),
  });
});

export const listUsersGrouped = asyncHandler(async (req: Request, res: Response) => {
  const data = await userService.listUsersGrouped(getUserContext(req));

  res.status(200).json({
    message: "Users grouped by company retrieved successfully",
    data,
  });
});

export const getUserById = asyncHandler(async (req: Request, res: Response) => {
  const data = await userService.getUserById(String(req.params.id), getUserContext(req));

  res.status(200).json({
    message: "User retrieved successfully",
    data,
  });
});

export const createUser = asyncHandler(async (req: Request, res: Response) => {
  const context = getUserContext(req);
  const data = await userService.createUser(req.body, context);

  res.status(201).json({
    message: "User created successfully. Credentials email sent.",
    requiresEmailVerification: false,
    data,
  });
});

export const updateUser = asyncHandler(async (req: Request, res: Response) => {
  const data = await userService.updateUser(String(req.params.id), req.body, getUserContext(req));

  res.status(200).json({
    message: "User updated successfully",
    data,
  });
});

export const toggleUserStatus = asyncHandler(async (req: Request, res: Response) => {
  const data = await userService.toggleStatus(String(req.params.id), getUserContext(req));

  res.status(200).json({
    message: `User ${data.status === "active" ? "enabled" : "disabled"} successfully`,
    data,
  });
});

export const deleteUser = asyncHandler(async (req: Request, res: Response) => {
  await userService.deleteUser(String(req.params.id), getUserContext(req));

  res.status(200).json({
    message: "User deleted successfully",
  });
});

export const changePassword = asyncHandler(async (req: Request, res: Response) => {
  const id = String(req.params.id);
  const { oldPassword, newPassword } = req.body as {
    oldPassword?: string;
    newPassword?: string;
  };

  if (!oldPassword || !newPassword) {
    throw new AppError(400, "Old password and new password are required");
  }

  if (newPassword.length < 6) {
    throw new AppError(400, "New password must be at least 6 characters");
  }

  const user = await User.findById(id);
  if (!user) {
    throw new AppError(404, "User not found");
  }

  const isMatch = await user.comparePassword(oldPassword);
  if (!isMatch) {
    throw new AppError(401, "Old password is incorrect");
  }

  user.password = newPassword;
  user.isFirstLogin = false;
  await user.save();

  res.status(200).json({
    message: "Password changed successfully",
  });
});
