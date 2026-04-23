"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  ChevronDown,
  LayoutDashboard,
  ShoppingCart,
  Users,
  FileText,
  Wallet,
  RotateCcw,
  Boxes,
  Package,
  Archive,
  ShoppingBag,
  Landmark,
  CreditCard,
  Receipt,
  Scale,
  BarChart3,
  Settings,
  LogOut,
  Shield,
  Lock,
  Building,
  Key,
  Activity,
  type LucideIcon,
} from "lucide-react";
import { SIDEBAR_CONFIG, isModuleGroup } from "@/data/sidebarConfig";
import { SUPERADMIN_SIDEBAR_CONFIG } from "@/data/superadmin.sidebar.config";
import { useAuth } from "@/hooks/use-auth";
import { hasModuleAccess } from "@/utils/permission";

// Static icon map — avoids the unreliable lucide-react/dynamic import
const iconMap: Record<string, LucideIcon> = {
  "layout-dashboard": LayoutDashboard,
  "shopping-cart": ShoppingCart,
  "users": Users,
  "file-text": FileText,
  "wallet": Wallet,
  "rotate-ccw": RotateCcw,
  "boxes": Boxes,
  "package": Package,
  "archive": Archive,
  "shopping-bag": ShoppingBag,
  "landmark": Landmark,
  "credit-card": CreditCard,
  "receipt": Receipt,
  "scale": Scale,
  "bar-chart-3": BarChart3,
  "settings": Settings,
  "shield": Shield,
  "lock": Lock,
  "building": Building,
  "key": Key,
  "activity": Activity,
};

const SidebarIcon = ({ name, size = 20 }: { name: string; size?: number }) => {
  const Icon = iconMap[name];
  if (!Icon) return null;
  return <Icon size={size} />;
};

const Sidebar = () => {
  const [openMenu, setOpenMenu] = useState<string | null>(null);
  const pathname = usePathname();
  const router = useRouter();
  const auth = useAuth();
  const { logout, user, isSuperAdmin, isCompanyAdmin } = auth;

  // Check if current user is super admin
  const isUserSuperAdmin = isSuperAdmin();

  // ─────────────────────────────────────────────────────────────
  // SUPER ADMIN RENDERING (simplified, flat structure)
  // ─────────────────────────────────────────────────────────────
  if (isUserSuperAdmin) {
    const isActive = (path: string) => pathname === path || pathname.startsWith(`${path}/`);

    const handleLogout = () => {
      // Clear auth state immediately
      logout();
      // Use window.location for instant redirect (bypass Next.js routing overhead)
      if (typeof window !== "undefined") {
        window.location.href = "/login";
      }
    };

    return (
      <div className="w-64 h-screen bg-gray-800 text-white p-4 flex flex-col">
        <h2 className="text-xl font-bold mb-6">
          <span className="text-blue-400">SuperAdmin</span>
        </h2>

        <ul className="space-y-2 flex-1 overflow-y-auto">
          {SUPERADMIN_SIDEBAR_CONFIG.map((item) => (
            <li key={item.path}>
              <Link
                href={item.path}
                className={`flex items-center gap-3 p-3 rounded-md transition ${
                  isActive(item.path)
                    ? "bg-blue-700 text-white"
                    : "hover:bg-gray-700 text-gray-300"
                }`}
                title={item.description}
              >
                <SidebarIcon name={item.icon} size={20} />
                <span className="font-medium">{item.title}</span>
              </Link>
            </li>
          ))}
        </ul>

        <div className="mt-auto pt-6 pb-4 border-t border-gray-700">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-2 p-3 rounded-md text-red-400 hover:bg-gray-700 hover:text-red-300 transition"
          >
            <LogOut size={20} />
            <span>Logout</span>
          </button>
        </div>
      </div>
    );
  }

  // ─────────────────────────────────────────────────────────────
  // REGULAR USER RENDERING (with modules and permissions)
  // ─────────────────────────────────────────────────────────────

  // Filter sidebar items based on module permissions
  // If noPermissionCheck is true, always show the item
  // If module requires permission, check user.permissions[module].view
  const visibleItems = SIDEBAR_CONFIG.filter((item) => {
    // For standalone items, check noPermissionCheck property
    if (!isModuleGroup(item)) {
      if ('noPermissionCheck' in item && item.noPermissionCheck) {
        return true;
      }
    }

    // For items with module requirements (module groups or standalone modules)
    if ("module" in item && item.module) {
      return hasModuleAccess(user, item.module);
    }

    // Default: show if no specific permission requirements
    return true;
  });

  console.log("[Sidebar] User:", { role: user?.role, email: user?.email });
  console.log("[Sidebar] Visible items after filtering:", visibleItems.map((i) => i.title));

  // Determine active parent menu based on current path
  const activeParentMenu = visibleItems.find((item) => {
    if (!isModuleGroup(item)) return false;
    return item.children.some(
      (child) =>
        pathname === child.path || pathname.startsWith(`${child.path}/`)
    );
  })?.title ?? null;

  const toggleMenu = (name: string) => {
    setOpenMenu((prev) => (prev === name ? null : name));
  };

  const isActive = (path: string) => pathname === path || pathname.startsWith(`${path}/`);

  const handleLogout = () => {
    // Clear auth state immediately
    logout();
    // Use window.location for instant redirect (bypass Next.js routing overhead)
    if (typeof window !== "undefined") {
      window.location.href = "/login";
    }
  };

  return (
    <div className="w-64 h-screen bg-gray-800 text-white p-4 flex flex-col">
      <h2 className="text-xl font-bold mb-6">Hisab Kitab</h2>

      <ul className="space-y-2 flex-1 overflow-y-auto">
        {visibleItems.map((item) => {
          const itemKey = item.title;
          const isOpen = openMenu === itemKey || activeParentMenu === itemKey;
          const isParentActive = activeParentMenu === itemKey;

          // Module group with children
          if (isModuleGroup(item)) {
            return (
              <li key={itemKey}>
                <button
                  onClick={() => toggleMenu(itemKey)}
                  className={`w-full flex items-center justify-between gap-2 rounded-md p-2 transition ${
                    isParentActive ? "bg-gray-700" : "hover:bg-gray-700"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <SidebarIcon name={item.icon} />
                    <span>{item.title}</span>
                  </div>
                  <ChevronDown
                    className={`transition-transform duration-300 ${
                      isOpen ? "rotate-180" : ""
                    }`}
                    size={18}
                  />
                </button>

                {/* Dropdown - Show ALL children if module is accessible */}
                <div
                  className={`overflow-hidden transition-all duration-300 ${
                    isOpen ? "max-h-96 mt-2" : "max-h-0"
                  }`}
                >
                  <ul className="ml-4 space-y-1">
                    {item.children.map((child) => (
                      <li key={child.name}>
                        <Link
                          href={child.path}
                          className={`flex items-center gap-2 p-2 rounded-md transition ${
                            isActive(child.path)
                              ? "bg-gray-700"
                              : "hover:bg-gray-700"
                          }`}
                        >
                          <SidebarIcon name={child.icon} />
                          <span>{child.name}</span>
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              </li>
            );
          }

          // Standalone item without children
          return (
            <li key={itemKey}>
              <Link
                href={item.path}
                className={`flex items-center gap-2 p-2 rounded-md transition ${
                  isActive(item.path) ? "bg-gray-700" : "hover:bg-gray-700"
                }`}
              >
                <SidebarIcon name={item.icon} />
                <span>{item.title}</span>
              </Link>
            </li>
          );
        })}

        {/* Role-Based Sections */}
        {isSuperAdmin() && (
          <li className="pt-2 border-t border-gray-700">
            <Link
              href="/superadmin/dashboard"
              className={`flex items-center gap-2 p-2 rounded-md transition ${
                isActive("/superadmin/dashboard") ? "bg-blue-700" : "hover:bg-gray-700"
              }`}
            >
              <Shield size={20} />
              <span className="font-semibold text-blue-300">SuperAdmin</span>
            </Link>
          </li>
        )}

        {/* Company Settings - visible to admin and above */}
        {(isCompanyAdmin() || isSuperAdmin()) && (
          <li className={isSuperAdmin() ? "" : "pt-2 border-t border-gray-700"}>
            <Link
              href="/settings/company"
              className={`flex items-center gap-2 p-2 rounded-md transition ${
                isActive("/settings/company") ? "bg-gray-700" : "hover:bg-gray-700"
              }`}
            >
              <Settings size={20} />
              <span>Company Settings</span>
            </Link>
          </li>
        )}
      </ul>

      <div className="mt-auto pt-6 pb-4 border-t border-gray-700">
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-2 p-3 rounded-md text-red-400 hover:bg-gray-700 hover:text-red-300 transition"
        >
          <LogOut size={20} />
          <span>Logout</span>
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
