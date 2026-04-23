import Link from "next/link";
import type { ReactNode } from "react";

interface StatCardProps {
  title: string;
  value: string;
  subtitle: string;
  subtitleColor?: string;
  icon: ReactNode;
  href?: string;
  ctaLabel?: string;
}

const StatCard = ({ title, value, subtitle, subtitleColor = "text-gray-400", icon, href, ctaLabel = "Open" }: StatCardProps) => {
  const content = (
    <div className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-emerald-200 hover:shadow-md">
      <div className="flex items-center justify-between mb-3">
        <span className="text-sm text-gray-500 font-medium">{title}</span>
        <span>{icon}</span>
      </div>
      <p className="text-2xl font-bold text-gray-900 mb-1">{value}</p>
      <p className={`text-xs ${subtitleColor}`}>{subtitle}</p>
      {href ? (
        <div className="mt-4 flex items-center justify-between text-sm font-medium text-emerald-600">
          <span>{ctaLabel}</span>
          <span aria-hidden="true">→</span>
        </div>
      ) : null}
    </div>
  );

  if (!href) {
    return content;
  }

  return <Link href={href}>{content}</Link>;
};

export default StatCard;
