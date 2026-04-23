"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Mail, Lock, Eye, EyeOff } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";

export default function LoginPage() {
  const router = useRouter();
  const { login, changeOwnPassword, isLoading, error, clearError } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [formError, setFormError] = useState("");
  const [isVerificationPending, setIsVerificationPending] = useState(false);
  const [pendingEmail, setPendingEmail] = useState("");
  const [showFirstLoginModal, setShowFirstLoginModal] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordChangeError, setPasswordChangeError] = useState("");

  const redirectAfterLogin = () => {
    const auth = useAuth.getState();
    const user = auth.user;

    if (user?.role === "superadmin") {
      router.push("/superadmin/dashboard");
    } else if (user?.role === "user") {
      router.push(auth.getFirstAccessiblePage());
    } else if (user?.onboardingCompleted) {
      router.push("/dashboard");
    } else {
      router.push("/onboarding/business");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");
    setIsVerificationPending(false);
    clearError();

    if (!email || !password) {
      setFormError("Email and password are required");
      return;
    }

    try {
      await login(email, password);
      const auth = useAuth.getState();
      const user = auth.user;
      
      console.log("[LoginPage] User after login:", {
        role: user?.role,
        email: user?.email,
        permissions: user?.permissions,
        onboardingCompleted: user?.onboardingCompleted,
      });

      if (user?.isFirstLogin) {
        setShowFirstLoginModal(true);
        return;
      }

      redirectAfterLogin();
    } catch (err) {
      const message = err instanceof Error ? err.message : "Login failed";
      if (message.toLowerCase().includes("verify your email")) {
        setPendingEmail(email);
        setIsVerificationPending(true);
        return;
      }
      setFormError(message);
    }
  };

  const handleFirstLoginPasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordChangeError("");

    if (newPassword.length < 6) {
      setPasswordChangeError("Password must be at least 6 characters");
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordChangeError("Passwords do not match");
      return;
    }

    try {
      await changeOwnPassword(password, newPassword);
      setShowFirstLoginModal(false);
      setPassword("");
      setNewPassword("");
      setConfirmPassword("");
      redirectAfterLogin();
    } catch (err) {
      setPasswordChangeError(err instanceof Error ? err.message : "Failed to change password");
    }
  };

  return (
    <div className="min-h-screen grid lg:grid-cols-2 bg-white">

      {/* ================= LEFT SIDE ================= */}
      <div className="flex items-center justify-center px-6 py-12 sm:px-10 lg:px-16">
        <div className="w-full max-w-md">
          {/* Logo */}
          <div className="flex items-center gap-2 mb-10">
            <Image
              src="/images/Logo.jpg"
              alt="Hisab Kitab"
              width={36}
              height={36}
              className="rounded-lg object-cover shadow-sm"
            />
            <span className="font-semibold text-gray-900 text-lg">Hisab Kitab</span>
          </div>

          {/* Email Verification Pending Screen */}
          {isVerificationPending ? (
            <div className="flex flex-col items-center justify-center text-center py-12">
              <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mb-4">
                <svg className="w-8 h-8 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Email Not Verified</h2>
              <p className="text-gray-600 text-sm mb-4">Please verify your email before logging in.</p>
              <div className="bg-amber-50 rounded-lg p-3 mb-6 w-full">
                <p className="text-gray-900 font-semibold text-sm break-all">{pendingEmail}</p>
              </div>
              <p className="text-gray-600 text-sm mb-6 leading-relaxed">We've sent a verification link to your inbox. Check your spam folder if you don't see it.</p>
              <button
                type="button"
                onClick={() => {
                  setIsVerificationPending(false);
                  setEmail("");
                  setPassword("");
                }}
                className="w-full px-4 py-2 border border-gray-300 hover:bg-gray-50 text-gray-700 font-semibold rounded-lg transition mb-4"
              >
                Back to Login
              </button>
              <p className="text-sm text-gray-600">
                Didn't receive the email?{" "}
                <Link href="/register" className="text-orange-600 hover:text-orange-700 font-semibold">
                  Try signing up again
                </Link>
              </p>
            </div>
          ) : (
            <>
              <h1 className="text-3xl font-bold tracking-tight text-gray-900 mb-2">Welcome back</h1>
              <p className="text-gray-500 text-sm mb-8 leading-relaxed">Sign in to your account to continue</p>

              {(formError || error) && (
                <div className={`px-4 py-3 rounded-xl text-sm mb-4 border ${formError?.includes("Email not verified") || error?.includes("Email not verified") ? "bg-amber-50 border-amber-200 text-amber-800" : "bg-red-50 border-red-200 text-red-700"}`}>
                  <div className="flex items-start gap-2">
                    <svg className="w-5 h-5 mt-0.5 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                    <div>
                      <p className="font-semibold">{formError || error}</p>
                      {(formError?.includes("Email not verified") || error?.includes("Email not verified")) && (
                        <p className="text-sm mt-1 opacity-90">Check your inbox for a verification link. It may take a few minutes to arrive.</p>
                      )}
                    </div>
                  </div>
                </div>
              )}

              <form className="flex flex-col gap-4 my-6" onSubmit={handleSubmit}>
                <div className="space-y-1.5">
                  <label className="block text-sm font-medium text-gray-700">Email address</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => { setEmail(e.target.value); setFormError(""); clearError(); }}
                      placeholder="you@company.com"
                      className="w-full h-11 rounded-xl border border-gray-300 bg-white pl-10 pr-3 text-sm shadow-sm transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[#1e3a5f]/20 focus:border-[#1e3a5f]"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="block text-sm font-medium text-gray-700">Password</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                    <input
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => { setPassword(e.target.value); setFormError(""); clearError(); }}
                      placeholder="Enter your password"
                      className="w-full h-11 rounded-xl border border-gray-300 bg-white pl-10 pr-10 text-sm shadow-sm transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[#1e3a5f]/20 focus:border-[#1e3a5f]"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                    >
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-end text-sm">
                  <Link href="/forgot-password" className="text-[#1e3a5f] hover:text-[#162d4a] font-medium transition-colors">
                    Forgot password?
                  </Link>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full h-11 rounded-xl bg-[#1e3a5f] text-white font-semibold shadow-sm transition-all duration-200 hover:bg-[#162d4a] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? "Signing in..." : "Sign in"}
                </button>
              </form>

            </>
          )}
        </div>
      </div>

      {/* ================= RIGHT SIDE ================= */}
      <div className="hidden lg:flex flex-col items-center justify-center bg-linear-to-br from-green-50 to-green-200 px-12 text-center relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-100/40 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-green-100/40 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />

        <div className="relative z-10 max-w-md">
          <Image
            src="/images/Logo.jpg"
            alt="Hisab-Kitaab"
            width={112}
            height={112}
            className="rounded-2xl shadow-lg mb-6 object-cover mx-auto"
          />
          <h2 className="text-xl font-bold text-[#1e3a5f] mb-4">Hisab-Kitaab</h2>
          <h3 className="text-3xl font-bold tracking-tight text-gray-900 mb-3">
            Accounting made simple
          </h3>
          <p className="text-gray-500 text-sm leading-relaxed mb-8">
            Manage invoices, track expenses, and get insights into your
            business finances with powerful yet simple tools.
          </p>

          <div className="text-left space-y-4 max-w-sm mx-auto">
            {[
              ["Smart Invoicing", "Create professional invoices in seconds"],
              ["Real-time Insights", "Track your cash flow with live dashboards"],
              ["Tax Compliance", "Stay compliant with automated tax calculations"],
            ].map(([title, desc]) => (
              <div key={title} className="flex gap-3">
                <span className="w-2.5 h-2.5 mt-2 rounded-full bg-[#1e3a5f]" />
                <div>
                  <p className="font-semibold text-sm text-gray-900">{title}</p>
                  <p className="text-gray-500 text-sm">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {showFirstLoginModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <form
            onSubmit={handleFirstLoginPasswordChange}
            className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl"
          >
            <h2 className="text-xl font-bold text-gray-900">Change your password</h2>
            <p className="mt-2 text-sm text-gray-600">
              This is your first login. Please set a new password before continuing.
            </p>

            {passwordChangeError && (
              <div className="mt-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                {passwordChangeError}
              </div>
            )}

            <div className="mt-5 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">New password</label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(event) => setNewPassword(event.target.value)}
                  className="mt-1 w-full rounded-xl border border-gray-300 px-3 py-2 text-sm focus:border-[#1e3a5f] focus:outline-none focus:ring-2 focus:ring-[#1e3a5f]/20"
                  autoFocus
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Confirm password</label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(event) => setConfirmPassword(event.target.value)}
                  className="mt-1 w-full rounded-xl border border-gray-300 px-3 py-2 text-sm focus:border-[#1e3a5f] focus:outline-none focus:ring-2 focus:ring-[#1e3a5f]/20"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="mt-6 h-11 w-full rounded-xl bg-[#1e3a5f] font-semibold text-white transition hover:bg-[#162d4a] disabled:opacity-50"
            >
              {isLoading ? "Updating..." : "Update password"}
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
