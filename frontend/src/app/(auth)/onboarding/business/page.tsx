"use client";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useAuth } from "@/hooks/use-auth";
import { businessSchema, type BusinessFormData } from "@/lib/validations/onboarding";
import { BUSINESS_TYPES, INDUSTRIES } from "@/constants/indian-banks";
import { useOnboardingStore } from "@/store/onboarding-store";
import { useEffect } from "react";

export default function BusinessInfoPage() {
  const router = useRouter();
  const { updateOnboardingBusiness, isLoading, error, user } = useAuth();
  const { formData, setFormData, setCurrentUserId } = useOnboardingStore();

  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
    reset,
  } = useForm<BusinessFormData>({
    resolver: zodResolver(businessSchema),
    mode: "onChange",
    defaultValues: {
      businessName: formData.business.businessName || "",
      businessType: formData.business.businessType || "",
      industry: formData.business.industry || "",
      businessAddress: formData.business.businessAddress || "",
    },
  });

  // Set current user ID and sync form with store on mount
  useEffect(() => {
    if (user?.id) {
      setCurrentUserId(user.id);
    }
    reset({
      businessName: formData.business.businessName || "",
      businessType: formData.business.businessType || "",
      industry: formData.business.industry || "",
      businessAddress: formData.business.businessAddress || "",
    });
  }, [reset, formData.business, user?.id, setCurrentUserId]);

  const onSubmit = async (data: BusinessFormData) => {
    try {
      // Save to Zustand store (automatically persists to user-specific localStorage)
      setFormData("business", data);
      
      // Call backend API
      await updateOnboardingBusiness(data);
      router.push("/onboarding/bank");
    } catch {
      // error is set in the store
    }
  };

  const inputClass = (field: keyof BusinessFormData) =>
    `w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 ${
      errors[field]
        ? "border-red-400 focus:ring-red-200"
        : "border-gray-300 focus:ring-green-500"
    }`;

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="w-full max-w-2xl bg-white rounded-2xl shadow-lg p-8">
        <div className="flex items-center gap-3 mb-6">
          <div className="flex gap-2">
            <div className="w-8 h-8 rounded-full bg-green-500 text-white flex items-center justify-center text-sm font-bold">1</div>
            <div className="w-8 h-8 rounded-full bg-gray-200 text-gray-500 flex items-center justify-center text-sm font-bold">2</div>
            <div className="w-8 h-8 rounded-full bg-gray-200 text-gray-500 flex items-center justify-center text-sm font-bold">3</div>
          </div>
          <span className="text-sm text-gray-400 ml-2">Step 1 of 3</span>
        </div>

        <h2 className="text-2xl font-bold mb-2">Business Information</h2>
        <p className="text-gray-500 text-sm mb-6">Tell us about your business to get started</p>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm mb-4">{error}</div>
        )}

        <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
          <div>
            <label className="block text-sm font-medium mb-1">
              Business Name <span className="text-red-500">*</span>
            </label>
            <input
              {...register("businessName")}
              type="text"
              placeholder="Enter your business name"
              className={inputClass("businessName")}
            />
            {errors.businessName && <p className="text-red-500 text-xs mt-1">{errors.businessName.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">
              Business Type <span className="text-red-500">*</span>
            </label>
            <select {...register("businessType")} className={inputClass("businessType")}>
              <option value="">Select Business Type</option>
              {BUSINESS_TYPES.map((type) => (
                <option key={type.value} value={type.value}>
                  {type.label}
                </option>
              ))}
            </select>
            {errors.businessType && <p className="text-red-500 text-xs mt-1">{errors.businessType.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">
              Industry <span className="text-red-500">*</span>
            </label>
            <select {...register("industry")} className={inputClass("industry")}>
              <option value="">Select Industry</option>
              {INDUSTRIES.map((ind) => (
                <option key={ind.value} value={ind.value}>
                  {ind.label}
                </option>
              ))}
            </select>
            {errors.industry && <p className="text-red-500 text-xs mt-1">{errors.industry.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">
              Business Address <span className="text-red-500">*</span>
            </label>
            <textarea
              {...register("businessAddress")}
              placeholder="Enter complete address..."
              rows={3}
              className={inputClass("businessAddress")}
            />
            {errors.businessAddress && <p className="text-red-500 text-xs mt-1">{errors.businessAddress.message}</p>}
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={isLoading || !isValid}
              className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg transition disabled:opacity-50"
            >
              {isLoading ? "Saving..." : "Next →"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
