"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";

interface User {
  _id: string;
  id?: string;
  name: string;
  email: string;
  role: "admin" | "user" | "superadmin";
  status?: "active" | "inactive" | "invited";
  company?: {
    name: string;
    _id?: string;
  };
  createdAt: string;
}

interface RecentUsersTableProps {
  users: User[];
  isLoading?: boolean;
}

const statusBadgeClasses = {
  active: "bg-emerald-100 text-emerald-700 ring-1 ring-emerald-200",
  inactive: "bg-slate-100 text-slate-700 ring-1 ring-slate-200",
  invited: "bg-amber-100 text-amber-700 ring-1 ring-amber-200",
};

const roleBadgeClasses = {
  admin: "bg-purple-100 text-purple-700 ring-1 ring-purple-200",
  user: "bg-blue-100 text-blue-700 ring-1 ring-blue-200",
  superadmin: "bg-rose-100 text-rose-700 ring-1 ring-rose-200",
};

const formatDate = (date: string) => {
  return new Date(date).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};

export default function RecentUsersTable({
  users,
  isLoading = false,
}: RecentUsersTableProps) {
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

  if (!users || users.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">No users available</p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden">
      <table className="w-full">
        <thead>
          <tr className="border-b border-gray-200 bg-gray-50">
            <th className="px-4 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
              Email
            </th>
            <th className="px-4 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
              Company
            </th>
            <th className="px-4 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
              Role
            </th>
            <th className="px-4 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
              Status
            </th>
            <th className="px-4 py-4 text-center text-xs font-bold text-gray-600 uppercase tracking-wider">
              Action
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {users.map((user) => (
            <tr
              key={user._id || user.id}
              className="group hover:bg-gradient-to-r hover:from-blue-50/50 hover:to-transparent transition-all duration-200"
            >
              <td className="px-4 py-4 text-sm text-gray-600">{user.email}</td>
              <td className="px-4 py-4 text-sm font-medium text-gray-700">
                {user.company?.name || "—"}
              </td>
              <td className="px-4 py-4">
                <span
                  className={`inline-flex items-center px-3 py-1.5 rounded-lg text-xs font-bold ${
                    roleBadgeClasses[user.role]
                  }`}
                >
                  {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                </span>
              </td>
              <td className="px-4 py-4">
                <span
                  className={`inline-flex items-center px-3 py-1.5 rounded-lg text-xs font-bold ${
                    statusBadgeClasses[user.status || "inactive"]
                  }`}
                >
                  {user.status
                    ? user.status.charAt(0).toUpperCase() + user.status.slice(1)
                    : "Inactive"}
                </span>
              </td>
              <td className="px-4 py-4 text-center">
                <Link
                  href={`/admin/users/${user._id || user.id}`}
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
