"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Edit2, Eye, Plus, Power } from "lucide-react";
import DataTable from "@/components/table/DataTable";
import type { Column, TableAction } from "@/components/table/DataTable";
import { getAllCompanies, updateCompanyStatus } from "@/services/company.api";
import { useAuth } from "@/hooks/use-auth";
import { Company } from "@/lib/validations/company";

const StatusBadge = ({ status }: { status: Company["status"] }) => (
  <span
    className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${
      status === "active"
        ? "bg-green-100 text-green-800"
        : status === "inactive"
          ? "bg-red-100 text-red-800"
          : "bg-gray-100 text-gray-800"
    }`}
  >
    {status === "active" ? "Active" : status === "inactive" ? "Inactive" : "Archived"}
  </span>
);

const getCompanyId = (company: Company) => company._id || company.id || "";

export default function CompaniesPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [companies, setCompanies] = useState<Company[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");

  useEffect(() => {
    if (user && user.role !== "superadmin") {
      router.replace("/unauthorized");
    }
  }, [user, router]);

  useEffect(() => {
    if (user?.role !== "superadmin") return;

    const fetchCompanies = async () => {
      try {
        setIsLoading(true);
        const response = await getAllCompanies(1, 50, search);
        setCompanies(response.data);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to fetch companies");
      } finally {
        setIsLoading(false);
      }
    };

    const timer = window.setTimeout(fetchCompanies, 250);
    return () => window.clearTimeout(timer);
  }, [search, user]);

  const handleStatusToggle = async (company: Company) => {
    const companyId = getCompanyId(company);
    const nextStatus = company.status === "active" ? "inactive" : "active";

    if (
      nextStatus === "inactive" &&
      !confirm("Deactivate this company? All users for this company will be blocked from login.")
    ) {
      return;
    }

    try {
      const updated = await updateCompanyStatus(companyId, nextStatus);
      setCompanies((current) =>
        current.map((item) => (getCompanyId(item) === companyId ? updated : item))
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update status");
    }
  };

  if (user?.role !== "superadmin") return null;

  const rows: Record<string, unknown>[] = companies.map((company) => ({
    id: getCompanyId(company),
    name: company.name,
    industry: company.industry || company.businessInfo?.industry || "-",
    status: company.status,
    createdAt: company.createdAt
      ? new Date(company.createdAt).toLocaleDateString()
      : "-",
    raw: company,
  }));

  const columns: Column[] = [
    { key: "name", header: "Company Name" },
    { key: "industry", header: "Industry" },
    {
      key: "status",
      header: "Status",
      accessor: (row) => <StatusBadge status={row.status as Company["status"]} />,
    },
    { key: "createdAt", header: "Created Date" },
  ];

  const actions: TableAction[] = [
    {
      label: "View",
      icon: Eye,
      onClick: (row) => router.push(`/superadmin/companies/${String(row.id)}`),
    },
    {
      label: "Edit",
      icon: Edit2,
      onClick: (row) => router.push(`/superadmin/companies/${String(row.id)}/edit`),
    },
    {
      label: "Toggle Status",
      icon: Power,
      variant: "danger",
      onClick: (row) => handleStatusToggle(row.raw as Company),
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Companies</h1>
            <p className="mt-1 text-gray-600">Onboard and manage companies</p>
          </div>
          <Link
            href="/superadmin/companies/new"
            className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
          >
            <Plus size={18} />
            New Company
          </Link>
        </div>

        <input
          type="text"
          placeholder="Search by company, industry, or admin email..."
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100"
        />

        {error && (
          <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-red-700">
            {error}
          </div>
        )}

        {isLoading ? (
          <div className="rounded-lg border border-gray-200 bg-white p-6">
            <div className="space-y-3">
              {[0, 1, 2, 3].map((item) => (
                <div key={item} className="h-12 animate-pulse rounded bg-gray-200" />
              ))}
            </div>
          </div>
        ) : rows.length === 0 ? (
          <div className="rounded-lg border border-gray-200 bg-white p-8 text-center text-gray-600">
            No companies found
          </div>
        ) : (
          <DataTable columns={columns} data={rows} actions={actions} />
        )}
      </div>
    </div>
  );
}
