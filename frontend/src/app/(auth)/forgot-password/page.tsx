"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Mail, ArrowLeft } from "lucide-react";
import { api } from "@/lib/api-client";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setMessage("");

    if (!email) {
      setError("Please enter your email address");
      return;
    }

    setIsLoading(true);
    try {
      const res = await api.post<{ message: string }>("/auth/forgot-password", { email });
      setMessage(res.message);
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

          <h1 className="text-2xl font-bold tracking-tight text-gray-900 mb-2">
            Forgot your password?
          </h1>
          <p className="text-gray-500 text-sm mb-6">
            Enter your email address and we&apos;ll send you a link to reset your password.
          </p>

          {message && (
            <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-xl text-sm mb-4">
              {message}
            </div>
          )}

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm mb-4">
              {error}
            </div>
          )}

          {!message ? (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <label className="block text-sm font-medium text-gray-700">
                  Email address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => { setEmail(e.target.value); setError(""); }}
                    placeholder="you@company.com"
                    className="w-full h-11 rounded-xl border border-gray-300 bg-white pl-10 pr-3 text-sm shadow-sm transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[#1e3a5f]/20 focus:border-[#1e3a5f]"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full h-11 rounded-xl bg-[#1e3a5f] text-white font-semibold shadow-sm transition-all duration-200 hover:bg-[#162d4a] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? "Sending..." : "Send Reset Link"}
              </button>
            </form>
          ) : (
            <p className="text-sm text-gray-500">
              Check your inbox and follow the instructions. If you don&apos;t see the email, check your spam folder.
            </p>
          )}

          <Link
            href="/login"
            className="flex items-center gap-2 justify-center text-sm text-[#1e3a5f] hover:text-[#162d4a] font-medium mt-6 transition-colors"
          >
            <ArrowLeft size={16} />
            Back to login
          </Link>
        </div>
      </div>
    </div>
  );
}
