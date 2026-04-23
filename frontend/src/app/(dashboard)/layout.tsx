"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/use-auth";
import Sidebar from "@/components/layout/sidebar";
import TopNav from "@/components/layout/top-nav";
import TrialBanner from "@/components/trial-banner";

const DashboardShellSkeleton = () => {
  return (
    <div className="flex h-screen animate-pulse bg-gray-50">
      <div className="hidden w-64 bg-gray-800 p-4 md:block">
        <div className="h-8 w-32 rounded bg-gray-700" />
        <div className="mt-8 space-y-3">
          {Array.from({ length: 7 }).map((_, index) => (
            <div key={index} className="h-10 rounded bg-gray-700/80" />
          ))}
        </div>
      </div>
      <div className="flex flex-1 flex-col overflow-hidden">
        <div className="border-b border-gray-200 bg-white px-6 py-4">
          <div className="h-11 max-w-xl rounded-xl bg-gray-100" />
        </div>
        <div className="flex-1 space-y-6 overflow-y-auto p-6">
          <div className="h-20 rounded-2xl bg-white" />
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
            {Array.from({ length: 5 }).map((_, index) => (
              <div key={index} className="h-36 rounded-2xl bg-white" />
            ))}
          </div>
          <div className="grid gap-4 xl:grid-cols-2">
            <div className="h-96 rounded-2xl bg-white" />
            <div className="h-96 rounded-2xl bg-white" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const { user, token, hasHydrated } = useAuth();
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    // Wait for Zustand persist to rehydrate from localStorage
    if (!hasHydrated) {
      console.log("[dashboardLayout] Waiting for hydration...");
      return;
    }

    setIsChecking(false);
    console.log("[dashboardLayout] Auth check:", { 
      hasToken: !!token, 
      userRole: user?.role, 
      onboardingCompleted: user?.onboardingCompleted 
    });
    
    if (!token) {
      console.log("[dashboardLayout] No token, redirecting to login");
      router.replace("/login");
    } else if (user?.role === "admin" && !user.onboardingCompleted) {
      // Only admins need to complete onboarding
      console.log("[dashboardLayout] Admin without onboarding, redirecting to onboarding");
      router.replace("/onboarding/business");
    } else {
      console.log("[dashboardLayout] Auth checks passed, allowing access");
    }
  }, [hasHydrated, token, user?.role, user?.onboardingCompleted, router]);

  // Show loading state while hydrating
  if (!hasHydrated || isChecking) {
    return <DashboardShellSkeleton />;
  }

  // Block rendering if no token OR if admin without completed onboarding
  if (!token || (user?.role === "admin" && !user.onboardingCompleted)) {
    return <DashboardShellSkeleton />;
  }

  return (
    <div className="flex flex-col h-screen">
      <TrialBanner />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar />
        <div className="flex-1 flex flex-col overflow-hidden">
          <TopNav />
          <div className="flex-1 overflow-y-auto">{children}</div>
        </div>
      </div>
    </div>
  );
}
