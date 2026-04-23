import type { UserRole } from "@/types";
import type { UserStatus } from "./types";

export const USER_ROLES: Record<Uppercase<UserRole>, UserRole> = {
  SUPERADMIN: "superadmin",
  ADMIN: "admin",
  USER: "user",
};

export const USER_STATUSES: Record<Uppercase<UserStatus>, UserStatus> = {
  ACTIVE: "active",
  DISABLED: "disabled",
};

export const userRoleOptions = [
  { value: USER_ROLES.USER, label: "User" },
  { value: USER_ROLES.ADMIN, label: "Admin" },
];

export const userStatusOptions = [
  { value: USER_STATUSES.ACTIVE, label: "Active" },
  { value: USER_STATUSES.DISABLED, label: "Disabled" },
];

export const getUserInitialValues = () => ({
  firstName: "",
  lastName: "",
  email: "",
  password: "",
  role: USER_ROLES.USER,
  companyId: "",
  isActive: true,
});

export const getUserStatus = (isActive: boolean): UserStatus =>
  isActive ? USER_STATUSES.ACTIVE : USER_STATUSES.DISABLED;
