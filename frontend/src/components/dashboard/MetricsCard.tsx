"use client";

import { ReactNode } from "react";

interface MetricsCardProps {
  title: string;
  value: string | number;
  icon: ReactNode;
  trend?: {
    value: number;
    direction: "up" | "down";
  };
  color?: "blue" | "green" | "purple" | "red" | "orange" | "indigo";
}

const colorClasses = {
  blue: {
    bg: "bg-gradient-to-br from-blue-50 via-blue-50/70 to-white",
    border: "border-blue-200/60 hover:border-blue-300",
    icon: "bg-gradient-to-br from-blue-500 to-blue-600 text-white shadow-lg shadow-blue-500/30",
    stat: "text-blue-900",
    label: "text-blue-700",
    trend: "text-blue-600",
  },
  green: {
    bg: "bg-gradient-to-br from-green-50 via-green-50/70 to-white",
    border: "border-green-200/60 hover:border-green-300",
    icon: "bg-gradient-to-br from-green-500 to-green-600 text-white shadow-lg shadow-green-500/30",
    stat: "text-green-900",
    label: "text-green-700",
    trend: "text-green-600",
  },
  purple: {
    bg: "bg-gradient-to-br from-purple-50 via-purple-50/70 to-white",
    border: "border-purple-200/60 hover:border-purple-300",
    icon: "bg-gradient-to-br from-purple-500 to-purple-600 text-white shadow-lg shadow-purple-500/30",
    stat: "text-purple-900",
    label: "text-purple-700",
    trend: "text-purple-600",
  },
  red: {
    bg: "bg-gradient-to-br from-red-50 via-red-50/70 to-white",
    border: "border-red-200/60 hover:border-red-300",
    icon: "bg-gradient-to-br from-red-500 to-red-600 text-white shadow-lg shadow-red-500/30",
    stat: "text-red-900",
    label: "text-red-700",
    trend: "text-red-600",
  },
  orange: {
    bg: "bg-gradient-to-br from-orange-50 via-orange-50/70 to-white",
    border: "border-orange-200/60 hover:border-orange-300",
    icon: "bg-gradient-to-br from-orange-500 to-orange-600 text-white shadow-lg shadow-orange-500/30",
    stat: "text-orange-900",
    label: "text-orange-700",
    trend: "text-orange-600",
  },
  indigo: {
    bg: "bg-gradient-to-br from-indigo-50 via-indigo-50/70 to-white",
    border: "border-indigo-200/60 hover:border-indigo-300",
    icon: "bg-gradient-to-br from-indigo-500 to-indigo-600 text-white shadow-lg shadow-indigo-500/30",
    stat: "text-indigo-900",
    label: "text-indigo-700",
    trend: "text-indigo-600",
  },
};

export default function MetricsCard({
  title,
  value,
  icon,
  trend,
  color = "blue",
}: MetricsCardProps) {
  const styles = colorClasses[color];

  return (
    <div
      className={`${styles.bg} ${styles.border} group relative rounded-2xl border p-6 shadow-md hover:shadow-2xl hover:scale-105 transition-all duration-300 cursor-pointer overflow-hidden`}
    >
      {/* Animated background glow */}
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none">
        <div className={`absolute -top-32 -right-32 w-64 h-64 rounded-full blur-3xl opacity-10 group-hover:opacity-20 transition-opacity`}
          style={{
            background: `linear-gradient(135deg, ${color === 'blue' ? '#3b82f6' : color === 'green' ? '#10b981' : color === 'purple' ? '#a855f7' : color === 'red' ? '#ef4444' : color === 'orange' ? '#f97316' : '#6366f1'})`
          }}
        ></div>
      </div>
      
      <div className="relative z-10">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <p className={`text-xs font-bold ${styles.label} uppercase tracking-wider`}>{title}</p>
            <p className={`mt-4 text-5xl font-black ${styles.stat} group-hover:scale-110 transition-transform origin-left duration-300`}>{value}</p>

            {trend && (
              <div className="mt-5 flex items-center gap-2">
                <span
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold ring-1 ${
                    trend.direction === "up" 
                      ? "text-green-700 ring-green-200 bg-green-50/50" 
                      : "text-red-700 ring-red-200 bg-red-50/50"
                  }`}
                >
                  {trend.direction === "up" ? "📈" : "📉"} {trend.value}%
                </span>
                <span className="text-xs text-gray-500 font-medium">vs last month</span>
              </div>
            )}
          </div>

          <div
            className={`${styles.icon} flex h-16 w-16 items-center justify-center rounded-2xl text-3xl shadow-lg group-hover:shadow-xl group-hover:scale-125 group-hover:-rotate-6 transition-all duration-300`}
          >
            {icon}
          </div>
        </div>
      </div>
    </div>
  );
}
