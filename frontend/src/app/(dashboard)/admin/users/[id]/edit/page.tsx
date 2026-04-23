"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { ArrowLeft, AlertCircle } from "lucide-react";
import { api } from "@/lib/api-client";
import { useAuth } from "@/hooks/use-auth";
import { LoadingSpinner } from "@/components/ui/loaders/global-loader";
import UserForm from "@/components/admin/user-form";
import { User } from "@/types";

export default function EditUserPage() {
  const router = useRouter();
  const params = useParams();
  const { isAdmin, hasPermission, user: currentUser } = useAuth();
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const canUpdate = hasPermission("user", "update");

  useEffect(() => {
    if (!isAdmin()) {
      router.replace("/dashboard");
      return;
    }

    if (!canUpdate) {
      setError("You don't have permission to edit users.");
      setIsLoading(false);
      return;
    }

    if (params.id === currentUser?.id) {
      setError("You cannot edit your own account from here. Please use your profile settings.");
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
  }, [params.id, isAdmin, canUpdate, currentUser?.id, router]);

  const handleSuccess = () => {
    router.push(`/admin/users/${params.id}`);
  };

  const handleError = (message: string) => {
    setError(message);
  };

  if (isLoading) {
    return (
      <div className="p-6 bg-gray-50 min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (error || !user) {
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
            <p className="text-red-700">{error || "User not found"}</p>
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
          <h1 className="text-3xl font-bold text-gray-900">Edit User</h1>
          <p className="text-gray-600 mt-1">Update user information and permissions</p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
            <p className="text-red-700">{error}</p>
          </div>
        )}

        {/* Form */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <UserForm mode="edit" user={user} onSuccess={handleSuccess} onError={handleError} />
        </div>
      </div>
    </div>
  );
}
