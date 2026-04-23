import { create } from "zustand";
import { persist } from "zustand/middleware";
import { api } from "@/lib/api-client";
import { User, UserPermissions, Company } from "@/types";
import { useOnboardingStore } from "@/store/onboarding-store";

interface AuthResponse {
  message: string;
  token: string;
  user: User;
  company?: Company;
}

interface OnboardingResponse {
  message: string;
  user: { id: string; onboarding: Record<string, unknown> };
}

interface AuthState {
  // Auth data
  user: User | null;
  company: Company | null;
  token: string | null;
  
  // State management
  isLoading: boolean;
  error: string | null;
  hasHydrated: boolean; // NEW: Track hydration status
  
  // Auth actions
  register: (data: { 
    firstName: string; 
    lastName: string; 
    email: string; 
    password: string;
    companyName?: string; 
  }) => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  changeOwnPassword: (oldPassword: string, newPassword: string) => Promise<void>;
  logout: () => void;
  updateOnboardingBusiness: (data: Record<string, string>) => Promise<void>;
  updateOnboardingBank: (data: Record<string, string>) => Promise<void>;
  updateOnboardingTax: (data: Record<string, string>) => Promise<void>;
  clearError: () => void;
  
  // Hydration (called after persist middleware loads)
  setHydrated: () => void;
  
  // Permission checks
  hasPermission: (module: string, action: string) => boolean;
  isAdmin: () => boolean;
  isSuperAdmin: () => boolean;
  isCompanyAdmin: () => boolean;
  getFirstAccessiblePage: () => string;
}

export const useAuth = create<AuthState>()(
  persist(
    (set, get) => ({
      // Initial state
      user: null,
      company: null,
      token: null,
      isLoading: false,
      error: null,
      hasHydrated: false,

      // Auth actions
      register: async (data) => {
    set({ isLoading: true, error: null });
    try {
      const registerData = {
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        password: data.password,
        companyName: data.companyName || `${data.firstName} ${data.lastName}'s Company`,
      };
      const res = await api.post<AuthResponse>("/auth/register", registerData);
      
      // Normalize companyId to string
      if (res.user && typeof res.user.companyId === 'string') {
        res.user.companyId = res.user.companyId;
      } else if (res.user && res.user.companyId) {
        res.user.companyId = String(res.user.companyId);
      }
      
      localStorage.setItem("token", res.token);
      localStorage.setItem("user", JSON.stringify(res.user));
      if (res.company) {
        localStorage.setItem("company", JSON.stringify(res.company));
      }
      set({ user: res.user, company: res.company || null, token: res.token, isLoading: false });
    } catch (err) {
      set({ isLoading: false, error: err instanceof Error ? err.message : "Registration failed" });
      throw err;
    }
  },

  login: async (email, password) => {
    set({ isLoading: true, error: null });
    try {
      const res = await api.post<AuthResponse>("/auth/login", { email, password });
      
      // Normalize companyId to string
      if (res.user && typeof res.user.companyId === 'string') {
        res.user.companyId = res.user.companyId;
      } else if (res.user && res.user.companyId) {
        res.user.companyId = String(res.user.companyId);
      }
      
      localStorage.setItem("token", res.token);
      localStorage.setItem("user", JSON.stringify(res.user));
      if (res.company) {
        localStorage.setItem("company", JSON.stringify(res.company));
      }
      set({ user: res.user, company: res.company || null, token: res.token, isLoading: false });
    } catch (err) {
      set({ isLoading: false, error: err instanceof Error ? err.message : "Login failed" });
      throw err;
    }
  },

  changeOwnPassword: async (oldPassword, newPassword) => {
    const user = get().user;
    if (!user) {
      throw new Error("User not found");
    }

    set({ isLoading: true, error: null });
    try {
      await api.put<{ message: string }>(`/users/${user.id}/password`, {
        oldPassword,
        newPassword,
      });

      const updatedUser = { ...user, isFirstLogin: false };
      localStorage.setItem("user", JSON.stringify(updatedUser));
      set({ user: updatedUser, isLoading: false });
    } catch (err) {
      set({ isLoading: false, error: err instanceof Error ? err.message : "Failed to change password" });
      throw err;
    }
  },

  logout: () => {
    // Get current user ID before clearing state
    const currentUser = get().user;
    
    // 1. Clear authentication data FIRST (synchronous, instant)
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    localStorage.removeItem("company");
    
    // 2. Clear state immediately (triggers Zustand persist middleware)
    set({ user: null, company: null, token: null });
    
    // 3. Clear onboarding data asynchronously (non-blocking)
    if (currentUser?.id) {
      // Use setTimeout to defer this to next tick (doesn't block redirect)
      if (typeof window !== "undefined") {
        Promise.resolve().then(() => {
          useOnboardingStore.getState().clearForUser(currentUser.id);
        });
      }
    }
  },

  updateOnboardingBusiness: async (data) => {
    set({ isLoading: true, error: null });
    try {
      await api.put<OnboardingResponse>("/auth/onboarding/business", data);
      set({ isLoading: false });
    } catch (err) {
      set({ isLoading: false, error: err instanceof Error ? err.message : "Failed to save business info" });
      throw err;
    }
  },

  updateOnboardingBank: async (data) => {
    set({ isLoading: true, error: null });
    try {
      await api.put<OnboardingResponse>("/auth/onboarding/bank", data);
      set({ isLoading: false });
    } catch (err) {
      set({ isLoading: false, error: err instanceof Error ? err.message : "Failed to save bank info" });
      throw err;
    }
  },

  updateOnboardingTax: async (data) => {
    set({ isLoading: true, error: null });
    try {
      const user = get().user;
      await api.put<OnboardingResponse>("/auth/onboarding/tax", data);
      if (user) {
        const updatedUser = { ...user, onboardingCompleted: true };
        localStorage.setItem("user", JSON.stringify(updatedUser));
        set({ user: updatedUser, isLoading: false });
      }
    } catch (err) {
      set({ isLoading: false, error: err instanceof Error ? err.message : "Failed to save tax info" });
      throw err;
    }
  },

  clearError: () => set({ error: null }),

  // Called after persist middleware rehydrates from localStorage
  setHydrated: () => set({ hasHydrated: true }),

  hasPermission: (module: string, action: string) => {
    const { user } = get();
    if (!user) return false;
    
    // SuperAdmin has all permissions
    if (user.role === "superadmin") return true;
    
    // Admin has all permissions
    if (user.role === "admin") return true;
    
    // User-level check against permissions
    return (user.permissions as any)?.[module]?.[action] ?? false;
  },

  isAdmin: () => {
    const { user } = get();
    return user?.role === "admin" ? true : false;
  },

  isSuperAdmin: () => {
    const { user } = get();
    return user?.role === "superadmin" ? true : false;
  },

  isCompanyAdmin: () => {
    const { user } = get();
    return user?.role === "admin" ? true : false;
  },

  getFirstAccessiblePage: () => {
    const { user } = get();

    if (!user) {
      return "/login";
    }

    // SuperAdmin goes to super admin dashboard
    if (user.role === "superadmin") {
      return "/superadmin/dashboard";
    }

    // Company admins go to dashboard
    if (user.role === "admin") {
      return "/dashboard";
    }

    // Map modules to their first accessible page
    const modulePages: { [key: string]: string } = {
      product: "/inventory/products",
      customer: "/sales/customers",
      sales: "/sales/invoices",
      invoice: "/sales/invoices",
      payment: "/sales/payments",
      report: "/reports",
      stock: "/inventory/stock",
    };

    // Check permissions and return first accessible page
    for (const [module, page] of Object.entries(modulePages)) {
      const hasPermission = user.permissions?.[module]?.view;
      if (hasPermission) {
        return page;
      }
    }

    // Fallback to dashboard if no permissions
    return "/dashboard";
  },
    }),
    {
      name: "auth-storage", // localStorage key
      // Normalize companyId after rehydration from localStorage
      onRehydrateStorage: () => (state) => {
        if (state?.user && state.user.companyId && typeof state.user.companyId === "object") {
          state.user.companyId = (state.user.companyId as any).$oid || 
                                  (state.user.companyId as any)._id || 
                                  String(state.user.companyId);
        }
        // Mark hydration as complete AFTER persist middleware loads
        state?.setHydrated();
      },
    }
  )
);
