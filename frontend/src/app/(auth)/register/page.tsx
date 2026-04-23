"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Eye, EyeOff } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useAuth } from "@/hooks/use-auth";
import { registerSchema, type RegisterFormData } from "@/lib/validations/register";

export default function RegisterPage() {
  const router = useRouter();
  const { register: registerUser, isLoading, error, clearError } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [registrationEmail, setRegistrationEmail] = useState("");
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    mode: "onChange",
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      password: "",
      confirmPassword: "",
      terms: false as unknown as true,
    },
  });

  const onSubmit = async (data: RegisterFormData) => {
    clearError();
    try {
      const response = await registerUser({
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        password: data.password,
      });
      
      // Show success message before redirect
      setRegistrationEmail(data.email);
      setShowSuccessMessage(true);
      
      // Redirect to login after 3 seconds
      setTimeout(() => {
        router.push("/login");
      }, 3000);
    } catch {
      // error is set in the store
    }
  };

  const inputClass = (fieldName: keyof RegisterFormData) =>
    `w-full h-11 rounded-xl border bg-white text-sm shadow-sm transition-all duration-200 focus:outline-none focus:ring-2 ${
      errors[fieldName]
        ? "border-red-400 focus:ring-red-200 focus:border-red-500"
        : "border-gray-300 focus:ring-[#1e3a5f]/20 focus:border-[#1e3a5f]"
    }`;

  return (
    <div className="min-h-screen grid lg:grid-cols-2 bg-white">

      {/* ================= LEFT SIDE ================= */}
      <div className="flex items-center justify-center px-6 py-12 sm:px-10 lg:px-16">
        <div className="w-full max-w-md">
          {/* Success Message */}
          {showSuccessMessage ? (
            <div className="flex flex-col items-center justify-center text-center py-12">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4 animate-bounce">
                <svg
                  className="w-8 h-8 text-green-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Account Created!</h2>
              <p className="text-gray-600 text-sm mb-4">
                We've sent a verification link to
              </p>
              <div className="bg-blue-50 rounded-lg p-3 mb-6 w-full">
                <p className="text-gray-900 font-semibold text-sm break-all">{registrationEmail}</p>
              </div>
              <p className="text-gray-600 text-sm mb-6 leading-relaxed">
                Please check your email and click the verification link to confirm your account. This link will expire in 24 hours.
              </p>
              <div className="flex items-center gap-2 text-sm text-gray-500 mb-4">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                Redirecting to verification page...
              </div>
              <button
                onClick={() => {
                  const emailParam = encodeURIComponent(registrationEmail);
                  router.push(`/verify-email-sent?email=${emailParam}`);
                }}
                className="text-blue-600 hover:text-blue-700 font-semibold text-sm"
              >
                Go Now
              </button>
            </div>
          ) : (
            <>
              <div className="flex items-center gap-2 mb-8">
                <Image src="/images/Logo.jpg" alt="Hisab Kitab" width={36} height={36} className="rounded-lg object-cover shadow-sm" />
                <span className="font-semibold text-gray-900 text-lg">Hisab Kitab</span>
              </div>

              <h1 className="text-3xl font-bold tracking-tight text-gray-900 mb-1">Create your account</h1>
              <p className="text-gray-500 text-sm mb-6 leading-relaxed">Start managing your finances today</p>

              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm mb-2">
                  {error}
                </div>
              )}

              <form className="flex flex-col gap-4" onSubmit={handleSubmit(onSubmit)}>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="block text-sm font-medium text-gray-700">First Name</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" />
                    </svg>
                  </span>
                  <input {...register("firstName")} type="text" placeholder="John" className={`${inputClass("firstName")} pl-10 pr-3`} />
                </div>
                {errors.firstName && <p className="text-red-500 text-xs mt-1">{errors.firstName.message}</p>}
              </div>
              <div className="space-y-1.5">
                <label className="block text-sm font-medium text-gray-700">Last Name</label>
                <input {...register("lastName")} type="text" placeholder="Doe" className={`${inputClass("lastName")} px-3`} />
                {errors.lastName && <p className="text-red-500 text-xs mt-1">{errors.lastName.message}</p>}
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-gray-700">Email address</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect width="20" height="16" x="2" y="4" rx="2" /><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
                  </svg>
                </span>
                <input {...register("email")} type="email" placeholder="you@company.com" className={`${inputClass("email")} pl-10 pr-3`} />
              </div>
              {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>}
            </div>

            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-gray-700">Password</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect width="18" height="11" x="3" y="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" />
                  </svg>
                </span>
                <input {...register("password")} type={showPassword ? "text" : "password"} placeholder="Create a strong password" className={`${inputClass("password")} pl-10 pr-10`} />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors">
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password.message}</p>}
            </div>

            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-gray-700">Confirm Password</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect width="18" height="11" x="3" y="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" />
                  </svg>
                </span>
                <input {...register("confirmPassword")} type={showConfirmPassword ? "text" : "password"} placeholder="Re-enter your password" className={`${inputClass("confirmPassword")} pl-10 pr-10`} />
                <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors">
                  {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              {errors.confirmPassword && <p className="text-red-500 text-xs mt-1">{errors.confirmPassword.message}</p>}
            </div>

            <div className="space-y-1">
              <div className="flex items-start gap-2 text-sm mt-1">
                <input {...register("terms")} type="checkbox" className={`h-4 w-4 mt-0.5 rounded border-gray-300 text-[#1e3a5f] focus:ring-[#1e3a5f]/20 ${errors.terms ? "border-red-400" : ""}`} />
                <span className="text-gray-600">
                  I agree to the <Link href="#" className="text-[#1e3a5f] hover:text-[#162d4a] font-medium transition-colors">Terms of Service</Link> and <Link href="#" className="text-[#1e3a5f] hover:text-[#162d4a] font-medium transition-colors">Privacy Policy</Link>
                </span>
              </div>
              {errors.terms && <p className="text-red-500 text-xs ml-6">{errors.terms.message}</p>}
            </div>

            <button type="submit" disabled={isLoading || !isValid} className="w-full h-11 rounded-xl bg-[#1e3a5f] text-white font-semibold shadow-sm transition-all duration-200 hover:bg-[#162d4a] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed">
              {isLoading ? "Creating Account..." : "Create Account"}
            </button>
          </form>

          <div className="flex items-center gap-3 my-5">
            <div className="flex-1 h-px bg-gray-200" />
            <span className="text-sm text-gray-400">Or sign up with</span>
            <div className="flex-1 h-px bg-gray-200" />
          </div>

          <p className="text-center text-sm text-gray-500 mt-6">
            Already have an account?{" "}
            <Link href="/login" className="text-[#1e3a5f] hover:text-[#162d4a] font-semibold transition-colors">Sign in</Link>
          </p>
            </>
          )}
        </div>
      </div>

      {/* ================= RIGHT SIDE ================= */}
      <div className="hidden lg:flex flex-col items-center justify-center bg-linear-to-br from-green-50 to-green-100 px-12 text-center relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-100/40 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-green-100/40 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />
        <div className="relative z-10 max-w-md">
          <Image src="/images/Logo.jpg" alt="Hisab-Kitaab" width={112} height={112} className="rounded-2xl shadow-lg mb-6 object-cover mx-auto" />
          <h2 className="text-xl font-bold text-[#1e3a5f] mb-4">Hisab-Kitaab</h2>
          <h3 className="text-3xl font-bold tracking-tight text-[#1e3a5f] mb-3">Join thousands of businesses</h3>
          <p className="text-gray-600 text-sm leading-relaxed mb-8">
            Manage your finances, track expenses, and grow your business with our powerful yet simple accounting tools.
          </p>
          <div className="text-left space-y-5 max-w-sm mx-auto">
            {[
              ["Free 30-day trial", "No credit card required. Cancel anytime."],
              ["Quick Setup", "Get started in minutes with our guided onboarding"],
              ["Expert Support", "24/7 customer support to help you succeed"],
              ["Secure & Compliant", "Bank-level security and tax compliance built-in"],
            ].map(([title, desc]) => (
              <div key={title} className="flex gap-3 items-start">
                <span className="shrink-0 w-6 h-6 rounded-full bg-green-500 flex items-center justify-center mt-0.5">
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                </span>
                <div>
                  <p className="font-semibold text-sm text-gray-900">{title}</p>
                  <p className="text-gray-500 text-sm">{desc}</p>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-10 bg-white/60 backdrop-blur-sm rounded-2xl p-6 text-left shadow-sm">
            <p className="text-gray-600 text-sm italic leading-relaxed mb-4">
              &quot;Hisab Kitab transformed how we manage our accounting. The intuitive interface and powerful features saved us hours every week.&quot;
            </p>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-linear-to-br from-[#1e3a5f] to-[#2d5a8f] flex items-center justify-center text-white font-bold text-sm">SJ</div>
              <div>
                <p className="font-semibold text-sm text-gray-900">Rajesh Patel</p>
                <p className="text-gray-500 text-xs">Bussiness Man</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
