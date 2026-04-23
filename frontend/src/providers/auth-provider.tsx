"use client";

import { ReactNode, useEffect } from "react";
import { useAuth } from "@/hooks/use-auth";

/**
 * AuthProvider - Initializes auth hydration on app startup
 * 
 * Wrap your app with this provider to ensure:
 * 1. Zustand persist middleware loads from localStorage BEFORE layouts render
 * 2. hasHydrated flag is set properly
 * 3. Route protection doesn't run during hydration
 * 
 * Usage in root layout (after upgrading to Server Components):
 * <AuthProvider>
 *   {children}
 * </AuthProvider>
 */
export function AuthProvider({ children }: { children: ReactNode }) {
  const { hasHydrated, setHydrated } = useAuth();

  // Ensure hydration is marked complete
  // (persist middleware handles most of it, but this ensures it's set)
  useEffect(() => {
    if (!hasHydrated) {
      // This is a safety net - persist middleware should have already called this
      // But we ensure it here to handle edge cases
      const timer = setTimeout(() => {
        setHydrated();
      }, 0);
      return () => clearTimeout(timer);
    }
  }, [hasHydrated, setHydrated]);

  return <>{children}</>;
}
