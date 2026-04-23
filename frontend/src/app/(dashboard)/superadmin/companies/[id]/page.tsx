"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Edit2, FileText, Loader2 } from "lucide-react";
import { getCompanyById } from "@/services/company.api";
import { Company } from "@/lib/validations/company";

const StatusBadge = ({ status }: { status: Company["status"] }) => (
  <span
    className={`inline-flex rounded-full px-3 py-1 text-sm font-semibold ${
      status === "active"
        ? "bg-green-100 text-green-800"
        : status === "inactive"
          ? "bg-red-100 text-red-800"
          : "bg-gray-100 text-gray-800"
    }`}
  >
    {status === "active" ? "Active" : status === "inactive" ? "Inactive" : "Archived"}
  </span>
);

const Detail = ({ label, value }: { label: string; value?: string | boolean }) => (
  <div>
    <p className="text-xs font-semibold uppercase text-gray-500">{label}</p>
    <p className="mt-1 text-gray-900">{value === true ? "Yes" : value === false ? "No" : value || "-"}</p>
  </div>
);

const DocumentLink = ({ label, url }: { label: string; url?: string }) => (
  <div className="rounded-lg border border-gray-200 bg-white p-4">
    <p className="mb-2 text-sm font-semibold text-gray-700">{label}</p>
    {url ? (
      <a
        href={url}
        target="_blank"
        rel="noreferrer"
        className="inline-flex items-center gap-2 text-sm font-medium text-blue-700 hover:underline"
      >
        <FileText className="h-4 w-4" />
        View document
      </a>
    ) : (
      <p className="text-sm text-gray-500">Not uploaded</p>
    )}
  </div>
);

export default function ViewCompanyPage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const [company, setCompany] = useState<Company | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCompany = async () => {
      try {
        setIsLoading(true);
        setCompany(await getCompanyById(params.id));
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load company");
      } finally {
        setIsLoading(false);
      }
    };

    fetchCompany();
  }, [params.id]);

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (error || !company) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <button onClick={() => router.back()} className="mb-4 flex items-center gap-2 text-blue-600">
          <ArrowLeft size={18} />
          Back
        </button>
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-red-700">
          {error || "Company not found"}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="mx-auto max-w-5xl space-y-6">
        <div className="flex items-center justify-between">
          <button onClick={() => router.back()} className="flex items-center gap-2 text-blue-600">
            <ArrowLeft size={18} />
            Back
          </button>
          <button
            onClick={() => router.push(`/superadmin/companies/${company._id}/edit`)}
            className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
          >
            <Edit2 size={18} />
            Edit
          </button>
        </div>

        <section className="rounded-lg border border-gray-200 bg-white p-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{company.name}</h1>
              <p className="mt-1 text-gray-600">{company.ownerEmail}</p>
            </div>
            <StatusBadge status={company.status} />
          </div>
        </section>

        <section className="rounded-lg border border-gray-200 bg-white p-6">
          <h2 className="mb-4 text-lg font-semibold text-gray-900">Company Details</h2>
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
            <Detail label="Business Type" value={company.businessType || company.businessInfo?.businessType} />
            <Detail label="Industry" value={company.industry || company.businessInfo?.industry} />
            <Detail label="Financial Year Start" value={company.financialYearStart?.slice(0, 10) || company.taxInfo?.financialYearStart} />
            <Detail label="Business Address" value={company.address || company.businessInfo?.businessAddress} />
          </div>
        </section>

        <section className="rounded-lg border border-gray-200 bg-white p-6">
          <h2 className="mb-4 text-lg font-semibold text-gray-900">Tax Information</h2>
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
            <Detail label="GST Registered" value={Boolean(company.gstStatus)} />
            <Detail label="GST Number" value={company.gstNumber || company.taxInfo?.gstin} />
            <Detail label="PAN Number" value={company.panNumber || company.taxInfo?.panNumber} />
          </div>
        </section>

        <section className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <DocumentLink label="GST Document" url={company.gstDocumentUrl} />
          <DocumentLink label="PAN Card Document" url={company.panDocumentUrl} />
        </section>
      </div>
    </div>
  );
}
