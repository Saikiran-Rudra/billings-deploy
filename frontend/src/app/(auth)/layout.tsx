"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuth } from "@/hooks/use-auth";

const publicPaths = ["/login", "/register", "/forgot-password"];
const publicPrefixes = ["/reset-password/", "/verify-email/"];

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, token, hasHydrated } = useAuth();
  const [isChecking, setIsChecking] = useState(true);

  const isPublic = publicPaths.includes(pathname) || publicPrefixes.some((p) => pathname.startsWith(p));
  const isOnboarding = pathname.startsWith("/onboarding");

  useEffect(() => {
    // Wait for Zustand persist to rehydrate from localStorage
    if (!hasHydrated) {
      console.log("[authLayout] Waiting for hydration...");
      return;
    }

    setIsChecking(false);
    console.log("[authLayout] Checking auth:", { 
      pathname, 
      isPublic, 
      isOnboarding, 
      hasToken: !!token, 
      userRole: user?.role 
    });

    // Case 1: No token and trying to access protected page → send to login
    if (!token && !isPublic) {
      console.log("[authLayout] No token on protected page, redirecting to /login");
      router.replace("/login");
      return;
    }

    // DO NOT redirect authenticated users from public pages
    // The login page handles its own redirects via router.push()
    // Doing a redirect here causes conflicts with login form redirects

    // Case 2: Team member trying to access onboarding page → block
    if (isOnboarding && token && user?.role === "user") {
      router.replace("/dashboard");
      return;
    }

    // Case 3: Admin with completed onboarding trying to re-access onboarding page → block
    if (isOnboarding && token && user?.role === "admin" && user?.onboardingCompleted) {
      router.replace("/dashboard");
      return;
    }

    // All other cases: allow access
  }, [hasHydrated, token, user?.role, user?.onboardingCompleted, isOnboarding, isPublic, pathname, router]);

  // Show loading state while checking hydration
  if (!hasHydrated || isChecking) {
    return (
      <div className="flex h-screen items-center justify-center bg-white">
        <div className="text-center">
          <div className="mb-4 inline-block h-8 w-8 animate-spin rounded-full border-4 border-gray-200 border-t-blue-600" />
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // Block rendering only during actual redirects (unauthenticated access to protected pages)
  if (!token && !isPublic) {
    return null;
  }

  // Block team members from accessing onboarding pages
  if (isOnboarding && token && user?.role === "user") {
    return null;
  }

  // Block admin who completed onboarding from re-accessing onboarding
  if (isOnboarding && token && user?.role === "admin" && user?.onboardingCompleted) {
    return null;
  }

  // All good - render the page
  return <>{children}</>;
}
