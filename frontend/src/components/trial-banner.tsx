"use client";

import { useAuth } from "@/hooks/use-auth";
import Link from "next/link";
import { Clock } from "lucide-react";

export default function TrialBanner() {
  const { company } = useAuth();

  if (!company) return null;

  const isTrialActive = company.trialEnd && new Date(company.trialEnd) > new Date();
  if (!isTrialActive) return null;

  // Calculate remaining days and trial duration
  const trialStart = new Date(company.trialStart || new Date());
  const trialEnd = new Date(company.trialEnd);
  const now = new Date();
  
  const diffTime = trialEnd.getTime() - now.getTime();
  const remainingDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  const totalTrialDays = Math.ceil((trialEnd.getTime() - trialStart.getTime()) / (1000 * 60 * 60 * 24));
  const progressPercent = Math.max(0, Math.min(100, ((totalTrialDays - remainingDays) / totalTrialDays) * 100));
  
  const isUrgent = remainingDays <= 3;
  const expiryDate = trialEnd.toLocaleDateString("en-US", { 
    month: "short", 
    day: "numeric", 
    year: "numeric" 
  });

  return (
    <div className="w-full px-3 sm:px-4 py-2 bg-gradient-to-r from-amber-50 via-yellow-50 to-orange-50 border-b border-amber-100 shadow-sm">
      <div className="max-w-full mx-auto">
        {/* Main content */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          {/* Left section: Icon + Text */}
          <div className="flex items-center gap-2 flex-1 min-w-0">
            {/* Icon */}
            <div className="flex-shrink-0">
              <div className="w-6 h-6 rounded-md bg-amber-100 flex items-center justify-center">
                <Clock className="w-4 h-4 text-amber-600" strokeWidth={2.5} />
              </div>
            </div>

            {/* Text content */}
            <div className="flex-1 min-w-0">
              <p className="text-xs sm:text-sm font-medium text-gray-900 truncate">
                Trial ends in{" "}
                <span className="font-bold text-amber-600">{remainingDays}d</span>
                {" "}• {expiryDate}
              </p>
            </div>
          </div>

          {/* Right section: CTA buttons */}
          {/* <div className="flex items-center gap-1.5 flex-shrink-0">
            <Link
              href="/plans"
              className="hidden sm:inline-flex px-3 py-1 text-xs font-medium text-gray-700 bg-white border border-gray-300 rounded hover:bg-gray-50 transition-colors duration-200"
            >
              Plans
            </Link>
            <Link
              href="/upgrade"
              className="inline-flex px-4 py-1 text-xs font-semibold text-white bg-gradient-to-r from-blue-600 to-blue-700 rounded hover:from-blue-700 hover:to-blue-800 transition-all duration-200 shadow-sm hover:shadow-md"
            >
              Upgrade
            </Link>
          </div> */}
        </div>
      </div>
    </div>
  );
}
