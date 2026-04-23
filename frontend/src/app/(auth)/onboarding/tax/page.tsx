"use client";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useAuth } from "@/hooks/use-auth";
import { taxSchema, type TaxFormData } from "@/lib/validations/onboarding";
import { FINANCIAL_YEAR_START, GST_REGISTRATION_STATUS } from "@/constants/indian-banks";
import { useOnboardingStore } from "@/store/onboarding-store";
import { useEffect } from "react";

export default function TaxPreferencesPage() {
  const router = useRouter();
  const { updateOnboardingTax, isLoading, error, user } = useAuth();
  const { formData, setFormData, setCurrentUserId, clearForUser, resetForm } = useOnboardingStore();

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isValid },
    reset,
  } = useForm<TaxFormData>({
    resolver: zodResolver(taxSchema),
    mode: "onChange",
    defaultValues: {
      gstRegistration: formData.tax.gstRegistration || "",
      gstin: formData.tax.gstin || "",
      panNumber: formData.tax.panNumber || "",
      financialYearStart: formData.tax.financialYearStart || "April",
    },
  });

  // Set current user ID and sync form with store on mount
  useEffect(() => {
    if (user?.id) {
      setCurrentUserId(user.id);
    }
    reset({
      gstRegistration: formData.tax.gstRegistration || "",
      gstin: formData.tax.gstin || "",
      panNumber: formData.tax.panNumber || "",
      financialYearStart: formData.tax.financialYearStart || "April",
    });
  }, [reset, formData.tax, user?.id, setCurrentUserId]);

  const gstRegistration = watch("gstRegistration");
  const isRegistered = gstRegistration === "Registered" || gstRegistration === "Composition Scheme";

  const onSubmit = async (data: TaxFormData) => {
    try {
      // Save to Zustand store
      setFormData("tax", data);
      
      // Call backend API
      await updateOnboardingTax(data);
      
      // CLEANUP: Clear user-specific onboarding data after successful submission
      if (user?.id) {
        clearForUser(user.id);
        resetForm();
      }
      
      router.push("/dashboard");
    } catch {
      // error is set in the store
    }
  };

  const inputClass = (field: keyof TaxFormData) =>
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
            <div className="w-8 h-8 rounded-full bg-green-500 text-white flex items-center justify-center text-sm font-bold">✓</div>
            <div className="w-8 h-8 rounded-full bg-green-500 text-white flex items-center justify-center text-sm font-bold">✓</div>
            <div className="w-8 h-8 rounded-full bg-green-500 text-white flex items-center justify-center text-sm font-bold">3</div>
          </div>
          <span className="text-sm text-gray-400 ml-2">Step 3 of 3</span>
        </div>

        <h2 className="text-2xl font-bold mb-2">Tax Information</h2>
        <p className="text-gray-500 text-sm mb-6">Complete your tax setup</p>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm mb-4">{error}</div>
        )}

        <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
          <div>
            <label className="block text-sm font-medium mb-1">
              GST Registration Status <span className="text-red-500">*</span>
            </label>
            <select {...register("gstRegistration")} className={inputClass("gstRegistration")}>
              <option value="">Select Registration Status</option>
              {GST_REGISTRATION_STATUS.map((status) => (
                <option key={status.value} value={status.value}>
                  {status.label}
                </option>
              ))}
            </select>
            {errors.gstRegistration && <p className="text-red-500 text-xs mt-1">{errors.gstRegistration.message}</p>}
          </div>

          {isRegistered && (
            <div>
              <label className="block text-sm font-medium mb-1">
                GSTIN <span className="text-red-500">*</span>
              </label>
              <input
                {...register("gstin")}
                type="text"
                placeholder="e.g., 22ABCDE1234F1Z5"
                className={inputClass("gstin")}
              />
              {errors.gstin && <p className="text-red-500 text-xs mt-1">{errors.gstin.message}</p>}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium mb-1">
              PAN Number <span className="text-red-500">*</span>
            </label>
            <input
              {...register("panNumber")}
              type="text"
              placeholder="e.g., ABCDE1234F"
              className={inputClass("panNumber")}
            />
            {errors.panNumber && <p className="text-red-500 text-xs mt-1">{errors.panNumber.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">
              Financial Year Start <span className="text-red-500">*</span>
            </label>
            <select {...register("financialYearStart")} className={inputClass("financialYearStart")}>
              <option value="">Select Financial Year Start</option>
              {FINANCIAL_YEAR_START.map((fy) => (
                <option key={fy.value} value={fy.value}>
                  {fy.label}
                </option>
              ))}
            </select>
            {errors.financialYearStart && <p className="text-red-500 text-xs mt-1">{errors.financialYearStart.message}</p>}
          </div>

          <div className="flex justify-between">
            <button
              type="button"
              onClick={() => router.push("/onboarding/bank")}
              className="border border-gray-300 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-50 transition"
            >
              ← Back
            </button>
            <button
              type="submit"
              disabled={isLoading || !isValid}
              className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg transition disabled:opacity-50"
            >
              {isLoading ? "Completing..." : "Complete Setup"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
