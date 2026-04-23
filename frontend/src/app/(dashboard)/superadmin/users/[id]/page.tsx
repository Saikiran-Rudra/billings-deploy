"use client";

import { useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Edit2 } from "lucide-react";
import UserDetailsCard from "@/components/dashboard/UserDetailsCard";
import { LoadingSpinner } from "@/components/ui/loaders/global-loader";
import { useAuth } from "@/hooks/use-auth";
import { useUsers } from "@/hooks/use-users";

export default function UserDetailsPage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const { hasPermission } = useAuth();
  const { selectedUser, loading, error, fetchUser } = useUsers();

  useEffect(() => {
    fetchUser(params.id);
  }, [fetchUser, params.id]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (error || !selectedUser) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <button onClick={() => router.back()} className="mb-4 flex items-center gap-2 text-blue-600">
          <ArrowLeft size={18} />
          Back
        </button>
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-red-700">
          {error || "User not found"}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="mb-6 flex items-center justify-between">
        <button onClick={() => router.back()} className="flex items-center gap-2 text-blue-600">
          <ArrowLeft size={18} />
          Back
        </button>
        {hasPermission("user", "update") && (
          <button
            onClick={() => router.push(`/superadmin/users/${params.id}/edit`)}
            className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
          >
            <Edit2 size={18} />
            Edit
          </button>
        )}
      </div>
      <UserDetailsCard user={selectedUser} />
    </div>
  );
}
