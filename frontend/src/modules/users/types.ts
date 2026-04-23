import type { UserPermissions, UserRole } from "@/types";

export type UserStatus = "active" | "disabled";

export interface UserCompany {
  id: string;
  name: string;
}

export interface ManagedUser {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: UserRole;
  permissions: UserPermissions;
  companyId?: string;
  company?: UserCompany;
  isActive: boolean;
  status: UserStatus;
  isVerified: boolean;
  isEmailVerified: boolean;
  isFirstLogin: boolean;
  isModuleAssigned: boolean;
  onboardingCompleted: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface UserListFilters {
  companyId?: string;
  role?: UserRole;
  status?: UserStatus;
  page?: number;
  limit?: number;
}

export interface UserFormValues {
  firstName: string;
  lastName: string;
  email: string;
  password?: string;
  role: UserRole;
  companyId: string;
  isActive?: boolean;
}

export interface UsersListResponse {
  message: string;
  data: ManagedUser[];
  pagination?: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

export interface UserResponse {
  message: string;
  data: ManagedUser;
}

export interface GroupedUsersResponse {
  message: string;
  data: {
    company: UserCompany | null;
    count: number;
    users: ManagedUser[];
  }[];
}
