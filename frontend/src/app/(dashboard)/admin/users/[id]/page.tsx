"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { ArrowLeft, Edit2, AlertCircle } from "lucide-react";
import { api } from "@/lib/api-client";
import { useAuth } from "@/hooks/use-auth";
import { LoadingSpinner } from "@/components/ui/loaders/global-loader";
import { User } from "@/types";

export default function ViewUserPage() {
  const router = useRouter();
  const params = useParams();
  const { isAdmin, hasPermission } = useAuth();
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const canView = hasPermission("user", "view");
  const canUpdate = hasPermission("user", "update");

  useEffect(() => {
    if (!isAdmin()) {
      router.replace("/dashboard");
      return;
    }

    if (!canView) {
      setError("You don't have permission to view user details.");
      setIsLoading(false);
      return;
    }

    const fetchUser = async () => {
      try {
        setIsLoading(true);
        const response = await api.get<{ data: User }>(`/users/${params.id}`);
        setUser(response.data);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load user details");
      } finally {
        setIsLoading(false);
      }
    };

    fetchUser();
  }, [params.id, isAdmin, canView, router]);

  if (isLoading) {
    return (
      <div className="p-6 bg-gray-50 min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 bg-gray-50 min-h-screen">
        <div className="w-full">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-blue-600 hover:text-blue-700 mb-4"
          >
            <ArrowLeft size={20} />
            Back
          </button>
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 flex items-start gap-4">
            <AlertCircle className="w-6 h-6 text-red-600 shrink-0 mt-0.5" />
            <p className="text-red-700">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="p-6 bg-gray-50 min-h-screen">
        <div className="w-full">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-blue-600 hover:text-blue-700 mb-4"
          >
            <ArrowLeft size={20} />
            Back
          </button>
          <div className="text-center py-12">
            <p className="text-gray-600">User not found</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="w-full">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-blue-600 hover:text-blue-700 mb-4"
          >
            <ArrowLeft size={20} />
            Back
          </button>
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{`${user.firstName} ${user.lastName}`}</h1>
              <p className="text-gray-600 mt-1">{user.email}</p>
            </div>
            {canUpdate && (
              <button
                onClick={() => router.push(`/admin/users/${user.id}/edit`)}
                className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
              >
                <Edit2 size={20} />
                Edit
              </button>
            )}
          </div>
        </div>

        {/* User Details */}
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          {/* Basic Information */}
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Basic Information</h2>
            <div className="grid grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">First Name</label>
                <p className="text-gray-900">{user.firstName || "-"}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">Last Name</label>
                <p className="text-gray-900">{user.lastName || "-"}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">Email</label>
                <p className="text-gray-900">{user.email}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">Phone</label>
                <p className="text-gray-900">{user.phone || "-"}</p>
              </div>
            </div>
          </div>

          {/* Role & Status */}
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Role & Status</h2>
            <div className="grid grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-2">Role</label>
                <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                  user.role === "admin" ? "bg-purple-100 text-purple-800" : "bg-blue-100 text-blue-800"
                }`}>
                  {user.role ? user.role.charAt(0).toUpperCase() + user.role.slice(1) : "User"}
                </span>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-2">Status</label>
                <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                  user.status === "active" ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"
                }`}>
                  {user.status ? user.status.charAt(0).toUpperCase() + user.status.slice(1) : "Active"}
                </span>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-2">Active</label>
                <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                  user.isActive ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                }`}>
                  {user.isActive ? "Active" : "Disabled"}
                </span>
              </div>
            </div>
          </div>

          {/* Additional Information */}
          {(user.companyId || user.createdAt) && (
            <div className="p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Additional Information</h2>
              <div className="grid grid-cols-2 gap-6">
                {user.companyId && (
                  <div>
                    <label className="block text-sm font-medium text-gray-600 mb-1">Company</label>
                    <p className="text-gray-900">{user.companyId}</p>
                  </div>
                )}
                {user.createdAt && (
                  <div>
                    <label className="block text-sm font-medium text-gray-600 mb-1">Created</label>
                    <p className="text-gray-900">{new Date(user.createdAt).toLocaleDateString()}</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
