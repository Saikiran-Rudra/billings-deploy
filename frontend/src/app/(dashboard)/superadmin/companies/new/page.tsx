"use client";

import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import CompanyFormComponent from "@/components/superadmin/company-form-component";

export default function NewCompanyPage() {
  const router = useRouter();

  const handleSuccess = () => {
    router.push("/superadmin/companies");
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-blue-600 hover:text-blue-700 mb-4"
          >
            <ArrowLeft size={20} />
            Back
          </button>
          <h1 className="text-3xl font-bold text-gray-900">Add Company</h1>
          <p className="text-gray-600 mt-1">Register a new company on the platform</p>
        </div>

        {/* Form */}
        <CompanyFormComponent mode="create" onSuccess={handleSuccess} />
      </div>
    </div>
  );
}
