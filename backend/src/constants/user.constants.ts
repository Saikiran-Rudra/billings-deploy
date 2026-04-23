export const USER_ROLES = {
  SUPER_ADMIN: "superadmin",
  ADMIN: "admin",
  USER: "user",
} as const;

export const USER_STATUSES = {
  ACTIVE: "active",
  DISABLED: "disabled",
} as const;

export type UserRoleValue = (typeof USER_ROLES)[keyof typeof USER_ROLES];
export type UserStatusValue = (typeof USER_STATUSES)[keyof typeof USER_STATUSES];

export const USER_ROLE_VALUES = Object.values(USER_ROLES) as [
  UserRoleValue,
  ...UserRoleValue[],
];

export const USER_STATUS_VALUES = Object.values(USER_STATUSES) as [
  UserStatusValue,
  ...UserStatusValue[],
];
