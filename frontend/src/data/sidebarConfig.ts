/**
 * Sidebar configuration with grouped modules
 * Each group represents a module with its child pages
 * 
 * Permission Model:
 * - Permissions are module-level (NOT page-level)
 * - If module is accessible → ALL its child pages are accessible
 * - Example: If "sales" module is allowed, user sees ALL sales pages (customers, invoices, payments, returns)
 */

import {
  ShoppingCart,
  Boxes,
  Landmark,
  BarChart3,
  Settings,
  Shield,
  LayoutDashboard,
  type LucideIcon,
} from "lucide-react";

export interface SidebarChild {
  name: string;
  path: string;
  icon: string;
}

export interface SidebarModuleGroup {
  title: string;
  module: string; // Permission module name (e.g., "sales", "product")
  icon: string;
  basePath?: string;
  children: SidebarChild[];
}

export interface SidebarStandaloneItem {
  title: string;
  path: string;
  icon: string;
  module?: string; // Optional - some items don't require permission
  noPermissionCheck?: boolean; // If true, always show regardless of permissions
}

type SidebarItem = SidebarModuleGroup | SidebarStandaloneItem;

/**
 * Check if item is a module group (has children)
 */
const isModuleGroup = (item: SidebarItem): item is SidebarModuleGroup => {
  return "children" in item && Array.isArray(item.children);
};

export const SIDEBAR_CONFIG: SidebarItem[] = [
  {
    title: "Dashboard",
    path: "/dashboard",
    icon: "layout-dashboard",
    noPermissionCheck: true, // Always visible
  },
  {
    title: "Sales",
    module: "sales",
    icon: "shopping-cart",
    basePath: "/sales",
    children: [
      { name: "Customers", path: "/sales/customers", icon: "users" },
      { name: "Invoices", path: "/sales/invoices", icon: "file-text" },
      { name: "Payments Received", path: "/sales/payments", icon: "wallet" },
      { name: "Sales Returns", path: "/sales/returns", icon: "rotate-ccw" },
    ],
  },
  {
    title: "Inventory",
    module: "product",
    icon: "boxes",
    basePath: "/inventory",
    children: [
      { name: "Products", path: "/inventory/products", icon: "package" },
      { name: "Suppliers", path: "/inventory/suppliers", icon: "building" },
      { name: "Purchases", path: "/inventory/purchases", icon: "shopping-bag" },
    ],
  },
  {
    title: "Accounting",
    module: "expense",
    icon: "landmark",
    basePath: "/accounting",
    children: [
      {
        name: "Cash & Bank",
        path: "/accounting/cashbank",
        icon: "credit-card",
      },
      { name: "Expenses", path: "/accounting/expenses", icon: "receipt" },
      {
        name: "Receivables",
        path: "/accounting/receivables",
        icon: "scale",
      },
    ],
  },
  {
    title: "Reports",
    path: "/reports",
    icon: "bar-chart-3",
    module: "report",
  },
  {
    title: "Settings",
    path: "/settings",
    icon: "settings",
    noPermissionCheck: true, // Always visible
  },
  {
    title: "User",
    module: "user",
    icon: "shield",
    basePath: "/admin",
    children: [
      { name: "Users", path: "/admin/users", icon: "users" },
     ],
  },
];

export type { SidebarItem };
export { isModuleGroup };
