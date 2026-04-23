/**
 * Super Admin Sidebar Configuration
 * ─────────────────────────────────
 * A flat, simple configuration for Super Admin users
 * No permission checks, no nested complexity
 * Super Admin has full access to all routes
 */

export interface SuperAdminSidebarItem {
  title: string;
  path: string;
  icon: string;
  description?: string;
}

export const SUPERADMIN_SIDEBAR_CONFIG: SuperAdminSidebarItem[] = [
  {
    title: "Dashboard",
    path: "/superadmin/dashboard",
    icon: "layout-dashboard",
    description: "Super Admin dashboard and system overview",
  },
  {
    title: "Companies",
    path: "/superadmin/companies",
    icon: "building",
    description: "Manage all companies in the system",
  },
  {
    title: "Users",
    path: "/superadmin/users",
    icon: "users",
    description: "Manage all users across all companies",
  },
  {
    title: "Licenses",
    path: "/superadmin/licenses",
    icon: "key",
    description: "Manage licenses and subscriptions",
  },
  {
    title: "Activity Logs",
    path: "/superadmin/activity",
    icon: "activity",
    description: "View system-wide activity logs",
  },
  {
    title: "System Settings",
    path: "/superadmin/settings",
    icon: "settings",
    description: "Configure system-wide settings",
  },
];
