"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter, useParams } from "next/navigation";

export default function VerifyEmailPage() {
  const router = useRouter();
  const params = useParams();
  const token = Array.isArray(params.token) ? params.token[0] : params.token;
  
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [message, setMessage] = useState("");
  
  // Use ref to prevent double verification
  const verificationAttempted = useRef(false);

  useEffect(() => {
    if (!token) {
      setStatus("error");
      setMessage("No verification token provided");
      return;
    }

    // Prevent double verification
    if (verificationAttempted.current) {
      console.log("⏭️  Verification already attempted, skipping...");
      return;
    }

    verificationAttempted.current = true;

    const verifyEmail = async () => {
      try {
        console.log("🔐 Starting email verification with token:", token.substring(0, 20));
        
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/auth/verify-email/${token}`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
            },
          }
        );

        console.log("🔐 Verification response status:", response.status);

        if (response.ok) {
          const data = await response.json();
          console.log("✅ Verification successful:", data.message);
          
          setStatus("success");
          setMessage(data.message || "Email verified successfully!");
          
          // Redirect to login after 2 seconds
          setTimeout(() => {
            console.log("↩️  Redirecting to login...");
            router.push("/login");
          }, 2000);
        } else {
          const data = await response.json();
          console.log("❌ Verification failed:", data.message);
          
          setStatus("error");
          setMessage(
            data.message || "Failed to verify email. Token may have expired."
          );
        }
      } catch (error) {
        console.error("❌ Verification error:", error);
        setStatus("error");
        setMessage("An error occurred while verifying your email.");
      }
    };

    verifyEmail();
  }, [token, router]);

  return (
    <div className="flex items-center justify-center min-h-screen bg-linear-to-br from-blue-50 to-indigo-100">
      <div className="bg-white rounded-lg shadow-xl p-8 max-w-md w-full mx-4">
        {status === "loading" && (
          <div className="flex flex-col items-center justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-blue-500 mb-4"></div>
            <h1 className="text-2xl font-bold text-gray-800 mb-2">
              Verifying Email
            </h1>
            <p className="text-gray-600 text-center">
              Please wait while we verify your email address...
            </p>
          </div>
        )}

        {status === "success" && (
          <div className="flex flex-col items-center justify-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
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
            <h1 className="text-2xl font-bold text-gray-800 mb-2">
              Email Verified!
            </h1>
            <p className="text-gray-600 text-center mb-4">{message}</p>
            <p className="text-sm text-gray-500 text-center">
              Redirecting to login in 2 seconds...
            </p>
          </div>
        )}

        {status === "error" && (
          <div className="flex flex-col items-center justify-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
              <svg
                className="w-8 h-8 text-red-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-gray-800 mb-2">
              Verification Failed
            </h1>
            <p className="text-gray-600 text-center mb-4">{message}</p>
            <button
              onClick={() => router.push("/login")}
              className="bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded-lg transition"
            >
              Back to Login
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
