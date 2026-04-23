"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import UserForm from "@/components/admin/user-form";
import { User } from "@/types";

export default function NewUserPage() {
  const router = useRouter();
  const { isAdmin } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isAdmin()) {
    return (
      <div className="p-6 text-center py-12">
        <p className="text-gray-600">You don't have permission to create users.</p>
      </div>
    );
  }

  const handleSuccess = () => {
    router.push("/admin/users");
  };

  const handleError = (message: string) => {
    setError(message);
  };

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
          <h1 className="text-3xl font-bold text-gray-900">Create New User</h1>
          <p className="text-gray-600 mt-1">Add a new team member to your organization</p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-700">{error}</p>
          </div>
        )}

        {/* Form */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <UserForm mode="create" onSuccess={handleSuccess} onError={handleError} />
        </div>
      </div>
    </div>
  );
}
