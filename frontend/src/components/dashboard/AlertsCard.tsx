"use client";

import { AlertCircle, Clock, Lock, CheckCircle, X } from "lucide-react";

interface Alert {
  id: string;
  type: "trial-expiring" | "disabled" | "pending-invite";
  title: string;
  description: string;
  count: number;
}

interface AlertsCardProps {
  alerts: Alert[];
}

const alertIconMap = {
  "trial-expiring": Clock,
  disabled: Lock,
  "pending-invite": AlertCircle,
};

const alertColorMap = {
  "trial-expiring": {
    bg: "bg-yellow-50",
    border: "border-yellow-200",
    icon: "bg-yellow-100 text-yellow-600",
    text: "text-yellow-900",
    badge: "bg-yellow-100 text-yellow-700",
  },
  disabled: {
    bg: "bg-red-50",
    border: "border-red-200",
    icon: "bg-red-100 text-red-600",
    text: "text-red-900",
    badge: "bg-red-100 text-red-700",
  },
  "pending-invite": {
    bg: "bg-blue-50",
    border: "border-blue-200",
    icon: "bg-blue-100 text-blue-600",
    text: "text-blue-900",
    badge: "bg-blue-100 text-blue-700",
  },
};

export default function AlertsCard({ alerts }: AlertsCardProps) {
  if (!alerts || alerts.length === 0) {
    return (
      <div className="rounded-2xl border border-green-200 bg-gradient-to-br from-green-50 to-green-100/50 p-6 shadow-sm hover:shadow-md transition-all">
        <div className="flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-green-500 text-white">
            <CheckCircle size={24} />
          </div>
          <div className="flex-1">
            <p className="font-semibold text-green-900">All Systems Normal</p>
            <p className="text-sm text-green-700 mt-1">Everything is running smoothly</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {alerts.map((alert) => {
        const Icon = alertIconMap[alert.type];
        const colors = alertColorMap[alert.type];
        return (
          <div
            key={alert.id}
            className={`${colors.bg} ${colors.border} rounded-2xl border p-5 flex items-start gap-4 shadow-sm hover:shadow-md transition-all group`}
          >
            <div className={`${colors.icon} flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl`}>
              <Icon size={24} />
            </div>
            <div className="flex-1 min-w-0">
              <p className={`font-semibold ${colors.text}`}>
                {alert.title}
              </p>
              <p className={`text-sm mt-1 ${colors.text} opacity-75`}>
                {alert.description}
              </p>
            </div>
            <div className={`${colors.badge} flex-shrink-0 px-3 py-1.5 rounded-lg text-sm font-bold whitespace-nowrap`}>
              {alert.count}
            </div>
            <button className={`${colors.text} opacity-40 group-hover:opacity-100 transition-opacity flex-shrink-0`}>
              <X size={18} />
            </button>
          </div>
        );
      })}
    </div>
  );
}
