"use client";

import { useState } from "react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

const salesByRange = {
  "7D": [
    { date: "Jan 16", sales: 12000 },
    { date: "Jan 17", sales: 18000 },
    { date: "Jan 18", sales: 15000 },
    { date: "Jan 19", sales: 28000 },
    { date: "Jan 20", sales: 22000 },
    { date: "Jan 21", sales: 32000 },
    { date: "Jan 22", sales: 30000 },
  ],
  "30D": [
    { date: "Week 1", sales: 98000 },
    { date: "Week 2", sales: 124000 },
    { date: "Week 3", sales: 118000 },
    { date: "Week 4", sales: 132000 },
  ],
  "90D": [
    { date: "Nov", sales: 302000 },
    { date: "Dec", sales: 386000 },
    { date: "Jan", sales: 452000 },
  ],
} as const;

type SalesRange = keyof typeof salesByRange;

const SalesTrend = () => {
  const [selectedRange, setSelectedRange] = useState<SalesRange>("7D");
  const data: readonly { date: string; sales: number }[] = salesByRange[selectedRange];
  const totalSales = data.reduce((sum, item) => sum + item.sales, 0);
  const averageSales = Math.round(totalSales / data.length);

  return (
    <div className="bg-white rounded-xl border border-gray-100 p-6 shadow-sm">
      <div className="mb-5 flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Sales Trend</h3>
          <p className="mt-1 text-sm text-gray-500">Track revenue patterns before receivables start piling up.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          {Object.keys(salesByRange).map((range) => (
            <button
              key={range}
              type="button"
              onClick={() => setSelectedRange(range as SalesRange)}
              className={`rounded-full px-3 py-1.5 text-sm font-medium transition ${
                selectedRange === range
                  ? "bg-emerald-500 text-white"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              {range}
            </button>
          ))}
        </div>
      </div>

      <div className="mb-5 grid gap-3 sm:grid-cols-2">
        <div className="rounded-xl bg-emerald-50 p-4">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-emerald-700">Total Sales</p>
          <p className="mt-2 text-2xl font-semibold text-gray-900">₹{totalSales.toLocaleString("en-IN")}</p>
        </div>
        <div className="rounded-xl bg-gray-50 p-4">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-gray-600">Average / Period</p>
          <p className="mt-2 text-2xl font-semibold text-gray-900">₹{averageSales.toLocaleString("en-IN")}</p>
        </div>
      </div>

      <div className="h-72 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
            <defs>
              <linearGradient id="salesGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#10b981" stopOpacity={0.02} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
            <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: "#9ca3af" }} />
            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 12, fill: "#9ca3af" }}
              tickFormatter={(value) => `₹${Number(value / 1000)}k`}
            />
            <Tooltip
              contentStyle={{ borderRadius: "8px", border: "1px solid #e5e7eb", boxShadow: "0 2px 8px rgba(0,0,0,0.08)" }}
              formatter={(value) => [`₹${Number(value).toLocaleString("en-IN")}`, "Sales"]}
            />
            <Area type="monotone" dataKey="sales" stroke="#10b981" strokeWidth={2.5} fill="url(#salesGradient)" />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default SalesTrend;
