"use client";

import { Edit2, Eye, Plus, Power } from "lucide-react";
import Link from "next/link";
import DataTable from "@/components/table/DataTable";
import type { Column, TableAction } from "@/components/table/DataTable";
import type { ManagedUser } from "@/modules/users/types";

interface UsersTableProps {
  users: ManagedUser[];
  isLoading?: boolean;
  canCreate: boolean;
  canUpdate: boolean;
  onView: (id: string) => void;
  onEdit: (id: string) => void;
  onToggleStatus: (id: string) => void;
}

const Badge = ({
  label,
  tone,
}: {
  label: string;
  tone: "green" | "red" | "blue" | "purple" | "gray";
}) => {
  const classes = {
    green: "bg-green-100 text-green-800",
    red: "bg-red-100 text-red-800",
    blue: "bg-blue-100 text-blue-800",
    purple: "bg-purple-100 text-purple-800",
    gray: "bg-gray-100 text-gray-800",
  };

  return (
    <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${classes[tone]}`}>
      {label}
    </span>
  );
};

const formatRole = (role: string) =>
  role === "superadmin"
    ? "Super Admin"
    : role.charAt(0).toUpperCase() + role.slice(1);

export default function UsersTable({
  users,
  isLoading = false,
  canCreate,
  canUpdate,
  onView,
  onEdit,
  onToggleStatus,
}: UsersTableProps) {
  const rows: Record<string, unknown>[] = users.map((user) => ({
    id: user.id,
    name: `${user.firstName} ${user.lastName}`,
    email: user.email,
    company: user.company?.name || "-",
    role: user.role,
    status: user.status,
    isActive: user.isActive,
  }));

  const columns: Column[] = [
    { key: "name", header: "Name" },
    { key: "email", header: "Email" },
    { key: "company", header: "Company" },
    {
      key: "role",
      header: "Role",
      accessor: (row) => (
        <Badge
          label={formatRole(String(row.role))}
          tone={row.role === "superadmin" ? "purple" : row.role === "admin" ? "blue" : "gray"}
        />
      ),
    },
    {
      key: "status",
      header: "Status",
      accessor: (row) => (
        <Badge
          label={row.status === "active" ? "Active" : "Disabled"}
          tone={row.status === "active" ? "green" : "red"}
        />
      ),
    },
  ];

  const actions: TableAction[] = [
    {
      label: "View",
      icon: Eye,
      onClick: (row) => onView(String(row.id)),
    },
    ...(canUpdate
      ? [
          {
            label: "Edit",
            icon: Edit2,
            onClick: (row: Record<string, unknown>) => onEdit(String(row.id)),
          },
          {
            label: "Toggle Status",
            icon: Power,
            onClick: (row: Record<string, unknown>) => onToggleStatus(String(row.id)),
            variant: "danger" as const,
          },
        ]
      : []),
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">Users</h1>
        {canCreate && (
          <Link
            href="/superadmin/users/new"
            className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
          >
            <Plus size={18} />
            New User
          </Link>
        )}
      </div>

      {isLoading && rows.length === 0 ? (
        <div className="rounded-lg border border-gray-200 bg-white p-6">
          <div className="space-y-3">
            {[0, 1, 2, 3, 4].map((item) => (
              <div key={item} className="h-12 animate-pulse rounded bg-gray-200" />
            ))}
          </div>
        </div>
      ) : !isLoading && rows.length === 0 ? (
        <div className="rounded-lg border border-gray-200 bg-white p-8 text-center text-gray-600">
          No users found
        </div>
      ) : (
        <DataTable columns={columns} data={rows} actions={actions} isLoading={isLoading} />
      )}
    </div>
  );
}
