"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import SelectField from "@/components/form/SelectField";
import UsersTable from "@/components/dashboard/UsersTable";
import { useAuth } from "@/hooks/use-auth";
import { useUsers } from "@/hooks/use-users";
import type { UserRole } from "@/types";
import type { UserStatus } from "@/modules/users/types";
import { userRoleOptions, userStatusOptions } from "@/modules/users/userForm.config";

type CompanyWithId = { id?: string; _id?: string; name: string };

const getCompanyId = (company: CompanyWithId) => company.id || company._id || "";

export default function SuperAdminUsersPage() {
  const router = useRouter();
  const { hasPermission } = useAuth();
  const {
    users,
    companies,
    loading,
    error,
    fetchUsers,
    fetchCompanies,
    toggleStatus,
  } = useUsers();

  const [companyId, setCompanyId] = useState("");
  const [role, setRole] = useState("");
  const [status, setStatus] = useState("");

  const canCreate = hasPermission("user", "create");
  const canUpdate = hasPermission("user", "update");

  useEffect(() => {
    fetchCompanies();
  }, [fetchCompanies]);

  useEffect(() => {
    fetchUsers({
      companyId: companyId || undefined,
      role: role ? (role as UserRole) : undefined,
      status: status ? (status as UserStatus) : undefined,
    });
  }, [companyId, role, status, fetchUsers]);

  const companyOptions = companies
    .map((company) => ({
      value: getCompanyId(company),
      label: company.name,
    }))
    .filter((company) => company.value);

  const handleToggleStatus = async (id: string) => {
    const user = users.find((item) => item.id === id);
    const nextState = user?.isActive ? "disable" : "enable";

    if (!confirm(`Are you sure you want to ${nextState} this user?`)) return;

    await toggleStatus(id);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="space-y-6">
        <div className="grid grid-cols-1 gap-4 rounded-lg border border-gray-200 bg-white p-4 md:grid-cols-3">
          <SelectField
            label="Company"
            name="companyId"
            value={companyId}
            options={companyOptions}
            placeholder="All companies"
            onChange={(event) => setCompanyId(event.target.value)}
          />
          <SelectField
            label="Role"
            name="role"
            value={role}
            options={userRoleOptions}
            placeholder="All roles"
            onChange={(event) => setRole(event.target.value)}
          />
          <SelectField
            label="Status"
            name="status"
            value={status}
            options={userStatusOptions}
            placeholder="All statuses"
            onChange={(event) => setStatus(event.target.value)}
          />
        </div>

        {error && (
          <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-red-700">
            {error}
          </div>
        )}

        <UsersTable
          users={users}
          isLoading={loading}
          canCreate={canCreate}
          canUpdate={canUpdate}
          onView={(id) => router.push(`/superadmin/users/${id}`)}
          onEdit={(id) => router.push(`/superadmin/users/${id}/edit`)}
          onToggleStatus={handleToggleStatus}
        />
      </div>
    </div>
  );
}
