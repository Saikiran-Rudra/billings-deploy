import { Types } from "mongoose";
import { IPermissions, UserRole } from "../models/User.js";
import { UserStatusValue } from "../constants/user.constants.js";

export interface UserRequestContext {
  userId?: string;
  companyId?: string | null;
  isSuperAdmin: boolean;
}

export interface CreateUserInput {
  firstName: string;
  lastName: string;
  email: string;
  password?: string;
  role?: UserRole;
  permissions?: IPermissions;
  companyId?: string;
}

export interface UpdateUserInput {
  firstName?: string;
  lastName?: string;
  role?: UserRole;
  permissions?: IPermissions;
  isActive?: boolean;
  isFirstLogin?: boolean;
  isModuleAssigned?: boolean;
  companyId?: string;
}

export interface ListUsersQuery {
  companyId?: string;
  role?: UserRole;
  status?: UserStatusValue;
  page?: number;
  limit?: number;
}

export interface UserCompanySummary {
  id: string;
  name: string;
}

export interface UserResponse {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: UserRole;
  permissions: IPermissions;
  companyId?: string;
  company?: UserCompanySummary;
  isActive: boolean;
  status: UserStatusValue;
  isVerified: boolean;
  isEmailVerified: boolean;
  isFirstLogin: boolean;
  isModuleAssigned: boolean;
  onboardingCompleted: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface GroupedUsersResponse {
  company: UserCompanySummary | null;
  count: number;
  users: UserResponse[];
}

export type CompanyRef =
  | Types.ObjectId
  | {
      _id: Types.ObjectId;
      name?: string;
    }
  | null
  | undefined;
