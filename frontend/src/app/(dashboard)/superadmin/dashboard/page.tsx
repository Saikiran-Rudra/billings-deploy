"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AlertCircle } from "lucide-react";
import MetricsCard from "@/components/dashboard/MetricsCard";
import RecentCompaniesTable from "@/components/dashboard/RecentCompaniesTable";
import RecentUsersTable from "@/components/dashboard/RecentUsersTable";
import AlertsCard from "@/components/dashboard/AlertsCard";
import { getDashboardData } from "@/services/dashboard.api";
import { useAuth } from "@/hooks/use-auth";

interface DashboardData {
  totalCompanies: number;
  totalUsers: number;
  activeCompanies: number;
  inactiveCompanies: number;
  recentCompanies: any[];
  recentUsers: any[];
}

export default function SuperAdminDashboard() {
  const router = useRouter();
  const { user } = useAuth();
  const [data, setData] = useState<DashboardData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Check if user is superadmin
    if (user && user.role !== "superadmin") {
      router.replace("/dashboard");
      return;
    }

    fetchDashboardData();
  }, [user, router]);

  const fetchDashboardData = async () => {
    try {
      console.log("[fetchDashboardData] Starting fetch...");
      console.log("[fetchDashboardData] User:", user);
      setIsLoading(true);
      setError(null);
      const result = await getDashboardData();
      console.log("[fetchDashboardData] Got result:", result);
      setData(result);
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : "Failed to load dashboard data";
      console.error("[fetchDashboardData] Error:", err);
      console.error("[fetchDashboardData] Error message:", errorMsg);
      setError(errorMsg);
    } finally {
      setIsLoading(false);
    }
  };

  // Generate alerts based on data
  const generateAlerts = () => {
    const alerts = [];

    if (data?.inactiveCompanies && data.inactiveCompanies > 0) {
      alerts.push({
        id: "inactive-companies",
        type: "disabled" as const,
        title: "Inactive Companies",
        description: "Companies that are currently inactive",
        count: data.inactiveCompanies,
      });
    }

    return alerts;
  };

  if (!user || user.role !== "superadmin") {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="mx-auto max-w-7xl px-6 py-8">
        {/* Header Section */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold text-gray-900">Dashboard</h1>
            <p className="mt-2 text-lg text-gray-600">
              Welcome back! 👋 Here's what's happening with your platform today.
            </p>
          </div>
          <button
            onClick={fetchDashboardData}
            disabled={isLoading}
            className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-500/30 hover:shadow-xl hover:shadow-blue-500/40 hover:scale-105 transition-all disabled:opacity-50"
          >
            <svg
              className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
              />
            </svg>
            Refresh
          </button>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="mb-6 rounded-2xl border border-red-200 bg-red-50 p-5 flex items-start gap-4 shadow-sm">
            <AlertCircle className="mt-1 text-red-600 flex-shrink-0" size={24} />
            <div className="flex-1">
              <p className="font-semibold text-red-900">Error Loading Dashboard</p>
              <p className="text-sm text-red-700 mt-1">{error}</p>
            </div>
          </div>
        )}

        {/* Metrics Cards */}
        <div className="mb-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          <MetricsCard
            title="Total Companies"
            value={isLoading ? "—" : data?.totalCompanies || 0}
            icon="🏢"
            color="blue"
          />
          <MetricsCard
            title="Total Users"
            value={isLoading ? "—" : data?.totalUsers || 0}
            icon="👥"
            color="purple"
          />
          <MetricsCard
            title="Active Companies"
            value={isLoading ? "—" : data?.activeCompanies || 0}
            icon="✓"
            color="green"
          />
          <MetricsCard
            title="Inactive Companies"
            value={isLoading ? "—" : data?.inactiveCompanies || 0}
            icon="⚠"
            color="red"
          />
        </div>

        {/* Alerts Section */}
        {data && generateAlerts().length > 0 && (
          <div className="mb-8">
            <h2 className="mb-4 text-xl font-bold text-gray-900">System Alerts</h2>
            <AlertsCard alerts={generateAlerts()} />
          </div>
        )}

        {/* Tables Section */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          {/* Recent Companies */}
          <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-lg hover:shadow-xl transition-all">
            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-900">Recent Companies</h2>
              <a href="#" className="text-sm font-semibold text-blue-600 hover:text-blue-700">View All →</a>
            </div>
            <RecentCompaniesTable
              companies={data?.recentCompanies || []}
              isLoading={isLoading}
            />
          </div>

          {/* Recent Users */}
          <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-lg hover:shadow-xl transition-all">
            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-900">Recent Users</h2>
              <a href="#" className="text-sm font-semibold text-blue-600 hover:text-blue-700">View All →</a>
            </div>
            <RecentUsersTable
              users={data?.recentUsers || []}
              isLoading={isLoading}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
