"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { Lock, Eye, EyeOff, ArrowLeft, CheckCircle } from "lucide-react";
import { api } from "@/lib/api-client";

export default function ResetPasswordPage() {
  const params = useParams();
  const router = useRouter();
  const token = params.token as string;

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!password || password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    setIsLoading(true);
    try {
      await api.post<{ message: string }>(`/auth/reset-password/${token}`, { password });
      setSuccess(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-lg p-8">
          <div className="flex items-center gap-2 mb-8">
            <Image
              src="/images/Logo.jpg"
              alt="Hisab Kitab"
              width={36}
              height={36}
              className="rounded-lg object-cover shadow-sm"
            />
            <span className="font-semibold text-gray-900 text-lg">Hisab Kitab</span>
          </div>

          {success ? (
            <div className="text-center">
              <CheckCircle className="mx-auto text-green-500 mb-4" size={48} />
              <h1 className="text-2xl font-bold text-gray-900 mb-2">Password Reset!</h1>
              <p className="text-gray-500 text-sm mb-6">
                Your password has been successfully reset. You can now log in with your new password.
              </p>
              <button
                onClick={() => router.push("/login")}
                className="w-full h-11 rounded-xl bg-[#1e3a5f] text-white font-semibold shadow-sm transition-all duration-200 hover:bg-[#162d4a] active:scale-[0.98]"
              >
                Go to Login
              </button>
            </div>
          ) : (
            <>
              <h1 className="text-2xl font-bold tracking-tight text-gray-900 mb-2">
                Reset your password
              </h1>
              <p className="text-gray-500 text-sm mb-6">
                Enter your new password below.
              </p>

              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm mb-4">
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="block text-sm font-medium text-gray-700">New Password</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                    <input
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => { setPassword(e.target.value); setError(""); }}
                      placeholder="At least 6 characters"
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

                <div className="space-y-1.5">
                  <label className="block text-sm font-medium text-gray-700">Confirm Password</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                    <input
                      type={showConfirmPassword ? "text" : "password"}
                      value={confirmPassword}
                      onChange={(e) => { setConfirmPassword(e.target.value); setError(""); }}
                      placeholder="Re-enter your password"
                      className="w-full h-11 rounded-xl border border-gray-300 bg-white pl-10 pr-10 text-sm shadow-sm transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[#1e3a5f]/20 focus:border-[#1e3a5f]"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                    >
                      {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full h-11 rounded-xl bg-[#1e3a5f] text-white font-semibold shadow-sm transition-all duration-200 hover:bg-[#162d4a] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? "Resetting..." : "Reset Password"}
                </button>
              </form>

              <Link
                href="/login"
                className="flex items-center gap-2 justify-center text-sm text-[#1e3a5f] hover:text-[#162d4a] font-medium mt-6 transition-colors"
              >
                <ArrowLeft size={16} />
                Back to login
              </Link>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
