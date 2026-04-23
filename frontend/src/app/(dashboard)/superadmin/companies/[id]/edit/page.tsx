"use client";

import { useRouter, useParams } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import CompanyFormComponent from "@/components/superadmin/company-form-component";

export default function EditCompanyPage() {
  const router = useRouter();
  const params = useParams();
  const companyId = params.id as string;

  const handleSuccess = () => {
    router.push(`/superadmin/companies/${companyId}`);
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
          <h1 className="text-3xl font-bold text-gray-900">Edit Company</h1>
          <p className="text-gray-600 mt-1">Update company information and settings</p>
        </div>

        {/* Form */}
        <CompanyFormComponent
          mode="edit"
          companyId={companyId}
          onSuccess={handleSuccess}
        />
      </div>
    </div>
  );
}
