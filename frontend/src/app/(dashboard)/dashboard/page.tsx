'use client';

import Link from "next/link";
import { TrendingUp, IndianRupee, Users, Wallet, Landmark, Plus, ArrowRight, CreditCard } from "lucide-react";
import StatCard from "@/components/dashboard/stat-card";
import { usePayments } from "@/hooks/usePayments";

/**
 * Format amount to Indian Rupee currency format
 * Examples: 1000 -> ₹1,000, 1500000 -> ₹15,00,000
 */
const formatCurrency = (amount: number): string => {
  return `₹${amount.toLocaleString('en-IN')}`;
};

/**
 * Get the current day suffix (st, nd, rd, th)
 */
const getDaySuffix = (day: number): string => {
  if (day > 3 && day < 21) return 'th';
  switch (day % 10) {
    case 1: return 'st';
    case 2: return 'nd';
    case 3: return 'rd';
    default: return 'th';
  }
};

export default function DashboardPage() {
  const { stats, isLoading, error } = usePayments();

  // Get current date info for subtitle
  const now = new Date();
  const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
  const dayOfMonth = now.getDate();
  const daySuffix = getDaySuffix(dayOfMonth);
  const monthName = now.toLocaleString('default', { month: 'long' });

  return (
    <div className="min-h-screen bg-gray-50 p-6 space-y-6">
      <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-sm text-gray-500">Welcome back! Here&apos;s what&apos;s happening with your business.</p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <Link href="/sales/invoices/new" className="flex items-center gap-2 rounded-lg bg-emerald-500 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-emerald-600">
            <Plus size={16} /> New Invoice
          </Link>
          <Link href="/sales/payments/new" className="flex items-center gap-2 rounded-lg bg-white px-4 py-2.5 text-sm font-medium text-gray-700 border border-gray-200 transition hover:bg-gray-50">
            <CreditCard size={16} /> Record Payment
          </Link>
          <Link href="accounting/expenses" className="flex items-center gap-2 rounded-lg bg-white px-4 py-2.5 text-sm font-medium text-gray-700 border border-gray-200 transition hover:bg-gray-50">
            <Plus size={16} /> Add Expense
          </Link>
        </div>
      </div>

      {/* <div className="rounded-2xl border border-emerald-100 bg-gradient-to-r from-emerald-50 via-white to-white p-5 shadow-sm">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-emerald-600">Priority Today</p>
            <h2 className="mt-1 text-lg font-semibold text-gray-900">Focus on collections and stock replenishment</h2>
            <p className="mt-1 text-sm text-gray-500">3 invoices need follow-up and 2 products are close to stockout.</p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link href="/receivables" className="inline-flex items-center gap-2 rounded-lg border border-emerald-200 bg-white px-4 py-2 text-sm font-medium text-emerald-700 transition hover:border-emerald-300 hover:bg-emerald-50">
              Review receivables <ArrowRight size={16} />
            </Link>
            <Link href="/purchases/new" className="inline-flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-50">
              Restock items <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </div> */}

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        <StatCard 
          title="Today's Payments" 
          value={isLoading ? "₹---" : formatCurrency(stats.totalToday)}
          subtitle={error ? `Error: ${error}` : `${dayOfMonth}${daySuffix} ${monthName}`}
          subtitleColor={error ? "text-red-500" : "text-emerald-500"} 
          icon={<TrendingUp size={20} className={error ? "text-red-500" : "text-emerald-500"} />} 
          href="sales/payments" 
          ctaLabel="Review collections" 
        />
        <StatCard 
          title="This Month's Payments" 
          value={isLoading ? "₹---" : formatCurrency(stats.totalThisMonth)}
          subtitle={error ? `Error: ${error}` : `${dayOfMonth} of ${daysInMonth} days`}
          subtitleColor={error ? "text-red-500" : "text-blue-500"} 
          icon={<IndianRupee size={20} className={error ? "text-red-500" : "text-blue-500"} />} 
          href="/reports" 
          ctaLabel="Open reports" 
        />
        <StatCard 
          title="Outstanding" 
          value="₹1,40,000" 
          subtitle="From 12 customers" 
          subtitleColor="text-orange-500" 
          icon={<Users size={20} className="text-orange-500" />} 
          href="accounting/receivables" 
          ctaLabel="Follow up" 
        />
        {/* <StatCard title="Cash in Hand" value="₹85,000" subtitle="As of today" icon={<Wallet size={20} className="text-violet-500" />} href="accounting/cashbank" ctaLabel="View ledger" />
        <StatCard title="Bank Balance" value="₹5,67,000" subtitle="Last updated 2h ago" icon={<Landmark size={20} className="text-gray-500" />} href="accounting/cashbank" ctaLabel="Check accounts" /> */}
      </div>

      {/* <div className="grid gap-4 xl:grid-cols-[minmax(0,2fr)_minmax(320px,1fr)]">
        <SalesTrend />
        <TopSellingProducts />
      </div>

      <div className="grid gap-4 xl:grid-cols-2">
        <LowStockAlerts />
        <PendingInvoices />
      </div> */}
    </div>
  );
}
