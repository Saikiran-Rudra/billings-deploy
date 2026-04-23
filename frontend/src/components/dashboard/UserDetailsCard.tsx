import { Building2, Mail, Shield, UserRound } from "lucide-react";
import type { ComponentType } from "react";
import type { ManagedUser } from "@/modules/users/types";

interface UserDetailsCardProps {
  user: ManagedUser;
}

const Detail = ({
  label,
  value,
  icon: Icon,
}: {
  label: string;
  value: string;
  icon: ComponentType<{ className?: string }>;
}) => (
  <div className="rounded-lg border border-gray-200 bg-white p-4">
    <div className="mb-2 flex items-center gap-2 text-sm font-medium text-gray-500">
      <Icon className="h-4 w-4" />
      {label}
    </div>
    <p className="text-base font-semibold text-gray-900">{value}</p>
  </div>
);

const formatRole = (role: string) =>
  role === "superadmin"
    ? "Super Admin"
    : role.charAt(0).toUpperCase() + role.slice(1);

export default function UserDetailsCard({ user }: UserDetailsCardProps) {
  return (
    <div className="space-y-4">
      <div className="rounded-lg border border-gray-200 bg-white p-6">
        <h1 className="text-2xl font-bold text-gray-900">
          {user.firstName} {user.lastName}
        </h1>
        <p className="mt-1 text-gray-600">{user.email}</p>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <Detail label="Name" value={`${user.firstName} ${user.lastName}`} icon={UserRound} />
        <Detail label="Email" value={user.email} icon={Mail} />
        <Detail label="Role" value={formatRole(user.role)} icon={Shield} />
        <Detail label="Company" value={user.company?.name || "-"} icon={Building2} />
        <Detail label="Status" value={user.status === "active" ? "Active" : "Disabled"} icon={Shield} />
      </div>
    </div>
  );
}
