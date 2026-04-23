"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";

interface Company {
  _id: string;
  id?: string;
  name: string;
  email?: string;
  status?: "active" | "inactive" | "trial" | "suspended";
  plan?: "starter" | "professional" | "enterprise";
  createdAt: string;
}

interface RecentCompaniesTableProps {
  companies: Company[];
  isLoading?: boolean;
}

const statusBadgeClasses = {
  active: "bg-emerald-100 text-emerald-700 ring-1 ring-emerald-200",
  inactive: "bg-slate-100 text-slate-700 ring-1 ring-slate-200",
  trial: "bg-amber-100 text-amber-700 ring-1 ring-amber-200",
  suspended: "bg-rose-100 text-rose-700 ring-1 ring-rose-200",
};

const planBadgeClasses = {
  starter: "bg-blue-100 text-blue-700 ring-1 ring-blue-200",
  professional: "bg-purple-100 text-purple-700 ring-1 ring-purple-200",
  enterprise: "bg-indigo-100 text-indigo-700 ring-1 ring-indigo-200",
};

const formatDate = (date: string) => {
  return new Date(date).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};

export default function RecentCompaniesTable({
  companies,
  isLoading = false,
}: RecentCompaniesTableProps) {
  if (isLoading) {
    return (
      <div className="space-y-3">
        {[...Array(5)].map((_, i) => (
          <div
            key={i}
            className="h-12 bg-gray-200 rounded-lg animate-pulse"
          />
        ))}
      </div>
    );
  }

  if (!companies || companies.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">No companies available</p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden">
      <table className="w-full">
        <thead>
          <tr className="border-b border-gray-200 bg-gray-50">
            <th className="px-4 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
              Company
            </th>
            <th className="px-4 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
              Plan
            </th>
            <th className="px-4 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
              Status
            </th>
            <th className="px-4 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
              Created
            </th>
            <th className="px-4 py-4 text-center text-xs font-bold text-gray-600 uppercase tracking-wider">
              Action
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {companies.map((company) => (
            <tr
              key={company._id || company.id}
              className="group hover:bg-gradient-to-r hover:from-blue-50/50 hover:to-transparent transition-all duration-200"
            >
              <td className="px-4 py-4">
                <div>
                  <p className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">{company.name}</p>
                  {company.email && (
                    <p className="text-sm text-gray-500">{company.email}</p>
                  )}
                </div>
              </td>
              <td className="px-4 py-4">
                {company.plan ? (
                  <span
                    className={`inline-flex items-center px-3 py-1.5 rounded-lg text-xs font-bold ${
                      planBadgeClasses[company.plan]
                    }`}
                  >
                    {company.plan.charAt(0).toUpperCase() +
                      company.plan.slice(1)}
                  </span>
                ) : (
                  <span className="text-gray-400 text-sm">—</span>
                )}
              </td>
              <td className="px-4 py-4">
                {company.status ? (
                  <span
                    className={`inline-flex items-center px-3 py-1.5 rounded-lg text-xs font-bold ${
                      statusBadgeClasses[company.status]
                    }`}
                  >
                    {company.status.charAt(0).toUpperCase() +
                      company.status.slice(1)}
                  </span>
                ) : (
                  <span className="text-gray-400 text-sm">—</span>
                )}
              </td>
              <td className="px-4 py-4 text-sm text-gray-600 font-medium">
                {formatDate(company.createdAt)}
              </td>
              <td className="px-4 py-4 text-center">
                <Link
                  href={`/admin/companies/${company._id || company.id}`}
                  className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-700 font-bold transition-colors opacity-0 group-hover:opacity-100"
                >
                  View
                  <ArrowRight size={16} />
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
