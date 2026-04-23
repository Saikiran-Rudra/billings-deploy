/**
 * Permission utility functions for module-based access control
 * Module-level permissions (NOT page-level)
 * If user has access to a module, they can access ALL pages inside that module
 */

import { User } from "@/types";

/**
 * Check if user has access to a module
 * @param user User object with permissions
 * @param module Module name (e.g., "sales", "product", "expense")
 * @returns true if user is admin or has view permission for the module
 */
export const hasModuleAccess = (user: User | null, module: string): boolean => {
  if (!user) return false;

  // Admins always have access to all modules
  if (user.role === "admin") return true;

  // Staff: check if they have view permission for the module
  return user.permissions?.[module]?.view === true;
};

/**
 * Get list of accessible modules for current user
 * @param user User object
 * @returns Array of module names user can access
 */
export const getAccessibleModules = (user: User | null): string[] => {
  if (!user) return [];

  if (user.role === "admin") {
    return [
      "sales",
      "product",
      "supplier",
      "expense",
      "report",
      "stock",
      "user",
    ];
  }

  return Object.entries(user.permissions || {})
    .filter(([_, permission]) => permission?.view === true)
    .map(([module, _]) => module);
};

/**
 * Check if user can perform a specific action in a module
 * Used for buttons/actions, not sidebar visibility
 * @param user User object
 * @param module Module name
 * @param action Action (view, create, update, delete)
 * @returns true if user has permission
 */
export const hasPermission = (
  user: User | null,
  module: string,
  action: string
): boolean => {
  if (!user) return false;
  if (user.role === "admin") return true;

  return (user.permissions as any)?.[module]?.[action] === true;
};
