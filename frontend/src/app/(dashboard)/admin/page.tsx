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

export default function AdminDashboard() {
  const router = useRouter();
  const { user } = useAuth();
  const [data, setData] = useState<DashboardData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Check if user is superadmin
    if (user && user.role !== "superadmin") {
      router.replace("/unauthorized");
      return;
    }

    fetchDashboardData();
  }, [user, router]);

  const fetchDashboardData = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const result = await getDashboardData();
      setData(result);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to load dashboard data"
      );
      console.error("Dashboard error:", err);
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
    <div className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-7xl space-y-8 p-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
            <p className="mt-1 text-gray-600">Welcome back, Super Admin</p>
          </div>
          <button
            onClick={fetchDashboardData}
            disabled={isLoading}
            className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 disabled:opacity-50 transition-colors"
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
          <div className="rounded-lg border border-red-200 bg-red-50 p-4 flex items-start gap-3">
            <AlertCircle className="mt-0.5 text-red-600 flex-shrink-0" size={20} />
            <div>
              <p className="font-medium text-red-900">Error Loading Dashboard</p>
              <p className="text-sm text-red-700 mt-1">{error}</p>
            </div>
          </div>
        )}

        {/* Metrics Cards */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
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
            color="orange"
          />
        </div>

        {/* Alerts Section */}
        {data && (
          <div>
            <h2 className="mb-4 text-lg font-bold text-gray-900">Alerts</h2>
            <AlertsCard alerts={generateAlerts()} />
          </div>
        )}

        {/* Tables Section */}
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
          {/* Recent Companies */}
          <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
            <h2 className="mb-6 text-lg font-bold text-gray-900">
              Recent Companies
            </h2>
            <RecentCompaniesTable
              companies={data?.recentCompanies || []}
              isLoading={isLoading}
            />
          </div>

          {/* Recent Users */}
          <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
            <h2 className="mb-6 text-lg font-bold text-gray-900">Recent Users</h2>
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
