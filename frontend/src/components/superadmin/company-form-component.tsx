"use client";

import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import FormWrapper from "@/components/form/FormWrapper";
import InputField from "@/components/form/InputField";
import SelectField from "@/components/form/SelectField";
import TextAreaField from "@/components/form/TextAreaField";
import DocumentUploadField from "@/components/form/DocumentUploadField";
import {
  createCompany,
  getCompanyById,
  updateCompany,
} from "@/services/company.api";
import {
  BUSINESS_TYPE_OPTIONS,
  INDUSTRY_OPTIONS,
} from "@/data/company-form.config";
import {
  CompanyFormData,
  CompanyUpdateFormData,
  companySchema,
  companyUpdateSchema,
  GstStatus,
} from "@/lib/validations/company";
import { useAuth } from "@/hooks/use-auth";
import { handleFileUpload } from "@/services/upload.api";
import { FINANCIAL_YEAR_START } from "@/constants/indian-banks";

interface CompanyFormComponentProps {
  mode: "create" | "edit";
  companyId?: string;
  onSuccess?: () => void;
}

const emptyForm: CompanyFormData = {
  name: "",
  businessType: "private_limited",
  industry: "services",
  address: "",
  financialYearStart: "April",
  gstStatus: "NO",
  gstNumber: "",
  gstDocumentUrl: "",
  panNumber: "",
  panDocumentUrl: "",
  admin: {
    firstName: "",
    lastName: "",
    email: "",
    mobile: "",
  },
};

export default function CompanyFormComponent({
  mode,
  companyId,
  onSuccess,
}: CompanyFormComponentProps) {
  const { user } = useAuth();
  const [formData, setFormData] = useState<CompanyFormData>(emptyForm);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(mode === "edit" && Boolean(companyId));
  const [isSaving, setIsSaving] = useState(false);
  const [uploadingField, setUploadingField] = useState<"gstDocumentUrl" | "panDocumentUrl" | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const normalizeGstStatus = (value: CompanyFormData["gstStatus"] | boolean | string | undefined): GstStatus =>
    value === true || value === "YES" ? "YES" : "NO";

  const normalizeBusinessType = (value: string | undefined): CompanyFormData["businessType"] => {
    switch (value) {
      case "proprietorship":
      case "partnership":
      case "llp":
      case "private_limited":
      case "public_limited":
      case "trust":
      case "ngo":
      case "other":
        return value;
      case "Sole Proprietorship":
        return "proprietorship";
      case "Private Limited":
      case "private limited":
        return "private_limited";
      case "Public Limited":
      case "public limited":
      case "publiclimited":
        return "public_limited";
      case "Society":
        return "other";
      default:
        return "other";
    }
  };

  const normalizeIndustry = (value: string | undefined): CompanyFormData["industry"] => {
    switch (value) {
      case "retail":
      case "manufacturing":
      case "services":
      case "technology":
      case "healthcare":
      case "education":
      case "construction":
      case "food_beverage":
      case "logistics":
      case "other":
        return value;
      case "Retail":
        return "retail";
      case "Manufacturing":
        return "manufacturing";
      case "Services":
        return "services";
      case "IT":
        return "technology";
      case "Healthcare":
        return "healthcare";
      case "Education":
        return "education";
      case "Construction":
        return "construction";
      case "Food & Beverage":
        return "food_beverage";
      case "Logistics":
        return "logistics";
      default:
        return "other";
    }
  };

  const normalizeFinancialYearStart = (value: string | undefined): string => {
    if (!value) return "April";

    if (FINANCIAL_YEAR_START.some((option) => option.value === value)) {
      return value;
    }

    const parsedDate = new Date(value);
    if (Number.isNaN(parsedDate.getTime())) {
      return "April";
    }

    return parsedDate.toLocaleString("en-US", { month: "long" });
  };

  useEffect(() => {
    if (mode !== "edit" || !companyId) return;

    const fetchCompany = async () => {
      try {
        setIsLoading(true);
        const company = await getCompanyById(companyId);
        setFormData({
          name: company.name || "",
          businessType: normalizeBusinessType(company.businessType || company.businessInfo?.businessType),
          industry: normalizeIndustry(company.industry || company.businessInfo?.industry),
          address: company.address || company.businessInfo?.businessAddress || "",
          financialYearStart: normalizeFinancialYearStart(
            company.financialYearStart || company.taxInfo?.financialYearStart
          ),
          gstStatus: normalizeGstStatus(company.gstStatus ?? company.taxInfo?.gstStatus ?? company.taxInfo?.gstRegistration),
          gstNumber: company.gstNumber || company.taxInfo?.gstNumber || company.taxInfo?.gstin || "",
          gstDocumentUrl: company.gstDocumentUrl || company.taxInfo?.gstDocumentUrl || "",
          panNumber: company.panNumber || company.taxInfo?.panNumber || "",
          panDocumentUrl: company.panDocumentUrl || company.taxInfo?.panDocumentUrl || "",
          admin: emptyForm.admin,
        });
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load company");
      } finally {
        setIsLoading(false);
      }
    };

    fetchCompany();
  }, [mode, companyId]);

  const setField = (field: keyof CompanyFormData, value: string | GstStatus) => {
    setFormData((prev) => {
      if (field === "gstStatus" && value === "NO") {
        return {
          ...prev,
          gstStatus: value,
          gstNumber: "",
          gstDocumentUrl: "",
        };
      }

      return { ...prev, [field]: value };
    });
    setErrors((prev) => {
      const next = { ...prev };
      delete next[String(field)];
      if (field === "gstStatus" && value === "NO") {
        delete next.gstNumber;
        delete next.gstDocumentUrl;
      }
      return next;
    });
  };

  const setAdminField = (field: keyof CompanyFormData["admin"], value: string) => {
    setFormData((prev) => ({
      ...prev,
      admin: { ...prev.admin, [field]: value },
    }));
    setErrors((prev) => {
      const next = { ...prev };
      delete next[`admin.${field}`];
      return next;
    });
  };

  const handleFileChange = async (
    field: "gstDocumentUrl" | "panDocumentUrl",
    file?: File
  ) => {
    if (!file) return;

    try {
      setUploadingField(field);
      const url = await handleFileUpload(file, field === "gstDocumentUrl" ? "gst" : "pan");
      setField(field, url);
    } catch (err) {
      setErrors((prev) => ({
        ...prev,
        [field]: err instanceof Error ? err.message : "Upload failed",
      }));
    } finally {
      setUploadingField(null);
    }
  };

  const validateForm = () => {
    const schema = mode === "create" ? companySchema : companyUpdateSchema;
    const payload = mode === "create" ? formData : toUpdatePayload(formData);
    const result = schema.safeParse(payload);

    if (result.success) {
      setErrors({});
      return true;
    }

    const nextErrors: Record<string, string> = {};
    result.error.issues.forEach((issue) => {
      nextErrors[issue.path.join(".")] = issue.message;
    });
    setErrors(nextErrors);
    return false;
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setSuccess(null);

    if (!validateForm()) return;

    try {
      setIsSaving(true);
      if (mode === "create") {
        await createCompany(formData);
        setSuccess("Company and admin user created successfully");
      } else if (companyId) {
        await updateCompany(companyId, toUpdatePayload(formData));
        setSuccess("Company updated successfully");
      }

      window.setTimeout(() => onSuccess?.(), 800);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save company");
    } finally {
      setIsSaving(false);
    }
  };

  if (user?.role !== "superadmin") return null;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <FormWrapper
      title={mode === "create" ? "Company Onboarding" : "Edit Company"}
      onSubmit={handleSubmit}
      submitLabel={mode === "create" ? "Create Company" : "Update Company"}
      isLoading={isSaving}
      error={error}
      success={success}
    >
      <div className="space-y-8">
        <section className="space-y-4">
          <h3 className="border-b pb-2 text-lg font-semibold text-gray-900">Company Details</h3>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <InputField label="Company Name" name="name" value={formData.name} onChange={(e) => setField("name", e.target.value)} error={errors.name} required />
            <SelectField label="Business Type" name="businessType" value={formData.businessType} options={BUSINESS_TYPE_OPTIONS} onChange={(e) => setField("businessType", e.target.value)} error={errors.businessType} required />
            <SelectField label="Industry" name="industry" value={formData.industry} options={INDUSTRY_OPTIONS} onChange={(e) => setField("industry", e.target.value)} error={errors.industry} required />
            <SelectField
              label="Financial Year Start"
              name="financialYearStart"
              value={formData.financialYearStart}
              options={FINANCIAL_YEAR_START}
              onChange={(e) => setField("financialYearStart", e.target.value)}
              error={errors.financialYearStart}
              required
            />
            <div className="md:col-span-2">
              <TextAreaField label="Business Address" name="address" rows={4} value={formData.address} onChange={(e) => setField("address", e.target.value)} error={errors.address} />
            </div>
          </div>
        </section>

        <section className="space-y-4">
          <h3 className="border-b pb-2 text-lg font-semibold text-gray-900">Tax Information</h3>
          <SelectField
            label="GST Registration Status"
            name="gstStatus"
            value={formData.gstStatus}
            options={[
              { label: "YES", value: "YES" },
              { label: "NO", value: "NO" },
            ]}
            onChange={(e) => setField("gstStatus", e.target.value as GstStatus)}
            error={errors.gstStatus}
            required
          />
          {formData.gstStatus === "YES" && (
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <InputField label="GST Number" name="gstNumber" value={formData.gstNumber} onChange={(e) => setField("gstNumber", e.target.value.toUpperCase())} error={errors.gstNumber} required />
              <DocumentUploadField
                label="GST Document"
                value={formData.gstDocumentUrl}
                error={errors.gstDocumentUrl}
                required
                isUploading={uploadingField === "gstDocumentUrl"}
                onChange={(file) => handleFileChange("gstDocumentUrl", file)}
                onRemove={() => setField("gstDocumentUrl", "")}
              />
            </div>
          )}
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <InputField label="PAN Number" name="panNumber" value={formData.panNumber} onChange={(e) => setField("panNumber", e.target.value.toUpperCase())} error={errors.panNumber} required />
            <DocumentUploadField
              label="PAN Card Document"
              value={formData.panDocumentUrl}
              error={errors.panDocumentUrl}
              required
              isUploading={uploadingField === "panDocumentUrl"}
              onChange={(file) => handleFileChange("panDocumentUrl", file)}
              onRemove={() => setField("panDocumentUrl", "")}
            />
          </div>
        </section>

        {mode === "create" && (
          <section className="space-y-4">
            <h3 className="border-b pb-2 text-lg font-semibold text-gray-900">Admin Details</h3>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <InputField label="First Name" name="admin.firstName" value={formData.admin.firstName} onChange={(e) => setAdminField("firstName", e.target.value)} error={errors["admin.firstName"]} required />
              <InputField label="Last Name" name="admin.lastName" value={formData.admin.lastName} onChange={(e) => setAdminField("lastName", e.target.value)} error={errors["admin.lastName"]} required />
              <InputField label="Email" name="admin.email" type="email" value={formData.admin.email} onChange={(e) => setAdminField("email", e.target.value)} error={errors["admin.email"]} required />
              <InputField label="Mobile Number" name="admin.mobile" value={formData.admin.mobile} onChange={(e) => setAdminField("mobile", e.target.value)} error={errors["admin.mobile"]} required />
            </div>
          </section>
        )}
      </div>
    </FormWrapper>
  );
}

const toUpdatePayload = (formData: CompanyFormData): CompanyUpdateFormData => ({
  name: formData.name,
  businessType: formData.businessType,
  industry: formData.industry,
  address: formData.address,
  financialYearStart: formData.financialYearStart,
  gstStatus: formData.gstStatus,
  gstNumber: formData.gstNumber,
  gstDocumentUrl: formData.gstDocumentUrl,
  panNumber: formData.panNumber,
  panDocumentUrl: formData.panDocumentUrl,
});
