import { api } from "@/lib/api-client";

export interface DashboardMetrics {
  totalCompanies: number;
  totalUsers: number;
  activeCompanies: number;
  inactiveCompanies: number;
  recentCompanies: any[];
  recentUsers: any[];
}

export async function getDashboardData(): Promise<DashboardMetrics> {
  try {
    console.log("[getDashboardData] Fetching from /admin/dashboard...");
    const response = await api.get("/admin/dashboard");
    console.log("[getDashboardData] Success:", response);
    return response;
  } catch (error) {
    console.error("[getDashboardData] Failed:", error);
    if (error instanceof Error) {
      console.error("Error message:", error.message);
    }
    throw error;
  }
}
