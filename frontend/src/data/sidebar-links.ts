// Sidebar navigation links configuration (migrated from Constant.ts)

export const SIDEBAR_LINKS = [
  { name: "Dashboard", path: "/dashboard", icon: "layout-dashboard" },
  {
    name: "Sales", path: "/sales", icon: "shopping-cart",
    dropdownlinks: [
      { name: "Customer", path: "/sales/customers", icon: "users" },
      { name: "Invoices", path: "/sales/invoices", icon: "file-text" },
      { name: "Payments Received", path: "/sales/payments", icon: "wallet" },
      { name: "Sales Returns", path: "/sales/returns", icon: "rotate-ccw" },
    ],
  },
  {
    name: "Inventory", path: "/inventory", icon: "boxes",
    dropdownlinks: [
      { name: "Products", path: "/inventory/products", icon: "package" },
      { name: "Stock Management", path: "/inventory/stock", icon: "archive" },
    ],
  },
  {
    name: "Accounting", path: "/accounting", icon: "landmark",
    dropdownlinks: [
      { name: "Cash & Bank", path: "/accounting/cashbank", icon: "credit-card" },
      { name: "Expenses", path: "/accounting/expenses", icon: "receipt" },
      { name: "Receivables", path: "/accounting/receivables", icon: "scale" },
    ],
  },
  { name: "Reports", path: "/reports", icon: "bar-chart-3" },
  { name: "Setting", path: "/settings", icon: "settings" },
  { name: "Learn", path: "/Learn", icon: "notebook-pen" },
  {
    name: "Admin",
    path: "/admin",
    icon: "shield",
    roleRequired: "admin",
    dropdownlinks: [
      { name: "Users", path: "/admin/users", icon: "users" },
      { name: "Permissions", path: "/admin/permissions", icon: "lock" },
    ],
  },
];

export type SidebarLink = (typeof SIDEBAR_LINKS)[number];
