"use client";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useAuth } from "@/hooks/use-auth";
import { bankSchema, type BankFormData } from "@/lib/validations/onboarding";
import { INDIAN_BANKS } from "@/constants/indian-banks";
import { useOnboardingStore } from "@/store/onboarding-store";
import { useEffect } from "react";

export default function BankAccountPage() {
  const router = useRouter();
  const { updateOnboardingBank, isLoading, error, user } = useAuth();
  const { formData, setFormData, setCurrentUserId } = useOnboardingStore();

  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
    reset,
  } = useForm<BankFormData>({
    resolver: zodResolver(bankSchema),
    mode: "onChange",
    defaultValues: {
      bankName: formData.bank.bankName || "",
      accountNumber: formData.bank.accountNumber || "",
      ifscCode: formData.bank.ifscCode || "",
      branchName: formData.bank.branchName || "",
    },
  });

  // Set current user ID and sync form with store on mount
  useEffect(() => {
    if (user?.id) {
      setCurrentUserId(user.id);
    }
    reset({
      bankName: formData.bank.bankName || "",
      accountNumber: formData.bank.accountNumber || "",
      ifscCode: formData.bank.ifscCode || "",
      branchName: formData.bank.branchName || "",
    });
  }, [reset, formData.bank, user?.id, setCurrentUserId]);

  const onSubmit = async (data: BankFormData) => {
    try {
      // Save to Zustand store (automatically persists to user-specific localStorage)
      setFormData("bank", data);
      
      // Only call backend if data is not empty
      if (data.bankName || data.accountNumber || data.ifscCode || data.branchName) {
        await updateOnboardingBank(data);
      }
      
      router.push("/onboarding/tax");
    } catch {
      // error is set in the store
    }
  };

  const inputClass = (field: keyof BankFormData) =>
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
            <div className="w-8 h-8 rounded-full bg-green-500 text-white flex items-center justify-center text-sm font-bold">2</div>
            <div className="w-8 h-8 rounded-full bg-gray-200 text-gray-500 flex items-center justify-center text-sm font-bold">3</div>
          </div>
          <span className="text-sm text-gray-400 ml-2">Step 2 of 3</span>
        </div>

        <h2 className="text-2xl font-bold mb-2">Bank Account Details</h2>
        <p className="text-gray-500 text-sm mb-6">Add your primary bank account for transactions (optional)</p>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm mb-4">{error}</div>
        )}

        <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
          <div>
            <label className="block text-sm font-medium mb-1">Bank Name</label>
            <select {...register("bankName")} className={inputClass("bankName")}>
              <option value="">Select Bank</option>
              {INDIAN_BANKS.map((bank) => (
                <option key={bank.value} value={bank.label}>
                  {bank.label}
                </option>
              ))}
            </select>
            {errors.bankName && <p className="text-red-500 text-xs mt-1">{errors.bankName.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium mb-1\">Account Number</label>
            <input
              {...register("accountNumber")}
              type="text"
              placeholder="Enter account number (9-18 digits)"
              className={inputClass("accountNumber")}
            />
            {errors.accountNumber && <p className="text-red-500 text-xs mt-1\">{errors.accountNumber.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium mb-1\">IFSC Code</label>
            <input
              {...register("ifscCode")}
              type="text"
              placeholder="e.g., SBIN0001234"
              className={inputClass("ifscCode")}
            />
            {errors.ifscCode && <p className="text-red-500 text-xs mt-1\">{errors.ifscCode.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium mb-1\">Branch Name</label>
            <input
              {...register("branchName")}
              type="text"
              placeholder="Enter branch name"
              className={inputClass("branchName")}
            />
            {errors.branchName && <p className="text-red-500 text-xs mt-1\">{errors.branchName.message}</p>}
          </div>


          <div className="flex justify-between">
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => router.push("/onboarding/business")}
                className="border border-gray-300 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-50 transition"
              >
                ← Back
              </button>
              <button
                type="button"
                onClick={() => router.push("/onboarding/tax")}
                className="text-gray-500 hover:text-gray-700 text-sm font-medium px-4 py-2 transition"
              >
                Skip for now
              </button>
            </div>
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
