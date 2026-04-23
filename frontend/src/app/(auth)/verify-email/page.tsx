"use client";

// This file is deprecated. Use /verify-email/[token]/page.tsx instead
// This redirect ensures old links still work

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function VerifyEmailRedirect() {
  const router = useRouter();

  useEffect(() => {
    router.push("/login");
  }, [router]);

  return (
    <div className="flex h-screen items-center justify-center">
      <p>Redirecting...</p>
    </div>
  );
}

