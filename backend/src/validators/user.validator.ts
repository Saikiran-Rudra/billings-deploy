import { z } from "zod";
import {
  USER_ROLE_VALUES,
  USER_STATUS_VALUES,
} from "../constants/user.constants.js";

const objectIdSchema = z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid companyId");

const permissionsSchema = z.record(
  z.string(),
  z.object({
    view: z.boolean().optional(),
    create: z.boolean().optional(),
    update: z.boolean().optional(),
    delete: z.boolean().optional(),
  })
);

export const createUserSchema = z.object({
  firstName: z.string().trim().min(1, "First name is required"),
  lastName: z.string().trim().min(1, "Last name is required"),
  email: z.string().trim().email("Invalid email format").toLowerCase(),
  password: z.string().min(6, "Password must be at least 6 characters").optional(),
  role: z.enum(USER_ROLE_VALUES).optional(),
  permissions: permissionsSchema.optional(),
  companyId: objectIdSchema.optional(),
});

export const updateUserSchema = z
  .object({
    firstName: z.string().trim().min(1, "First name is required").optional(),
    lastName: z.string().trim().min(1, "Last name is required").optional(),
    role: z.enum(USER_ROLE_VALUES).optional(),
    permissions: permissionsSchema.optional(),
    isActive: z.boolean().optional(),
    isFirstLogin: z.boolean().optional(),
    isModuleAssigned: z.boolean().optional(),
    companyId: objectIdSchema.optional(),
  })
  .refine((value) => Object.keys(value).length > 0, {
    message: "At least one field is required",
  });

export const listUsersQuerySchema = z.object({
  companyId: objectIdSchema.optional(),
  role: z.enum(USER_ROLE_VALUES).optional(),
  status: z.enum(USER_STATUS_VALUES).optional(),
  page: z.coerce.number().int().positive().optional(),
  limit: z.coerce.number().int().positive().max(100).optional(),
});

export const userIdSchema = z.object({
  id: z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid user id"),
});
