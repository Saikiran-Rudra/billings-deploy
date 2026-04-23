"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function VerifyEmailSentRedirect() {
  const router = useRouter();

  useEffect(() => {
    // This page has been removed - redirect to login
    router.push("/login");
  }, [router]);

  return null;
}

