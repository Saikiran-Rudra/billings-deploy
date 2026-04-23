"use client";

import { useEffect, useState, useMemo } from "react";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import {
  Calendar,
  Download,
  TrendingUp,
  DollarSign,
  Users,
  Package,
  CreditCard,
  Percent,
  ChevronDown,
} from "lucide-react";
import { api } from "@/lib/api-client";

type ReportType = "sales" | "purchase" | "inventory" | "customer" | "payment" | "gst" | "profit-loss";

interface ReportFilters {
  reportType: ReportType;
  fromDate: string;
  toDate: string;
  customerId?: string;
  productId?: string;
  status?: string;
}

interface SummaryCard {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: React.ReactNode;
  color: string;
}

const COLORS = ["#10b981", "#3b82f6", "#f59e0b", "#ef4444", "#8b5cf6", "#06b6d4", "#ec4899"];

const StatCard: React.FC<SummaryCard> = ({ title, value, subtitle, icon, color }) => (
  <div className={`${color} rounded-lg p-4 text-white`}>
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm font-medium opacity-90">{title}</p>
        <p className="mt-2 text-2xl font-bold">{value}</p>
        {subtitle && <p className="mt-1 text-xs opacity-75">{subtitle}</p>}
      </div>
      <div className="opacity-20 text-4xl">{icon}</div>
    </div>
  </div>
);

const FilterPanel: React.FC<{
  filters: ReportFilters;
  onFilterChange: (filters: ReportFilters) => void;
  onExport: () => void;
  loading: boolean;
}> = ({ filters, onFilterChange, onExport, loading }) => (
  <div className="mb-6 rounded-lg border border-gray-200 bg-white p-5 shadow-sm">
    <div className="mb-4 flex items-center justify-between">
      <h3 className="text-lg font-semibold text-gray-900">Filters</h3>
      <button
        onClick={onExport}
        disabled={loading}
        className="inline-flex items-center gap-2 rounded-lg bg-emerald-500 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-600 disabled:opacity-50"
      >
        <Download size={16} />
        Export
      </button>
    </div>

    <div className="grid gap-4 md:grid-cols-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Report Type</label>
        <select
          value={filters.reportType}
          onChange={(e) =>
            onFilterChange({ ...filters, reportType: e.target.value as ReportType })
          }
          className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
        >
          <option value="sales">Sales Report</option>
          <option value="purchase">Purchase Report</option>
          <option value="inventory">Inventory Report</option>
          <option value="customer">Customer Report</option>
          <option value="payment">Payment Report</option>
          <option value="gst">GST/Tax Report</option>
          <option value="profit-loss">Profit & Loss</option>
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">From Date</label>
        <input
          type="date"
          value={filters.fromDate}
          onChange={(e) => onFilterChange({ ...filters, fromDate: e.target.value })}
          className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">To Date</label>
        <input
          type="date"
          value={filters.toDate}
          onChange={(e) => onFilterChange({ ...filters, toDate: e.target.value })}
          className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
        <select
          value={filters.status || ""}
          onChange={(e) => onFilterChange({ ...filters, status: e.target.value || undefined })}
          className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
        >
          <option value="">All</option>
          <option value="paid">Paid</option>
          <option value="pending">Pending</option>
          <option value="draft">Draft</option>
        </select>
      </div>
    </div>
  </div>
);

const DataTable: React.FC<{
  columns: { key: string; label: string; format?: (val: any) => string }[];
  data: any[];
  loading: boolean;
}> = ({ columns, data, loading }) => (
  <div className="rounded-lg border border-gray-200 bg-white shadow-sm overflow-hidden">
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead className="border-b border-gray-200 bg-gray-50">
          <tr>
            {columns.map((col) => (
              <th key={col.key} className="px-6 py-3 text-left font-semibold text-gray-700">
                {col.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {loading ? (
            <tr>
              <td colSpan={columns.length} className="px-6 py-8 text-center text-gray-500">
                Loading...
              </td>
            </tr>
          ) : data.length === 0 ? (
            <tr>
              <td colSpan={columns.length} className="px-6 py-8 text-center text-gray-500">
                No data available
              </td>
            </tr>
          ) : (
            data.map((row, idx) => (
              <tr key={idx} className="hover:bg-gray-50">
                {columns.map((col) => (
                  <td key={col.key} className="px-6 py-4 text-gray-700">
                    {col.format ? col.format(row[col.key]) : row[col.key]}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  </div>
);

export default function ReportsPage() {
  const [filters, setFilters] = useState<ReportFilters>({
    reportType: "sales",
    fromDate: new Date(new Date().getFullYear(), new Date().getMonth(), 1)
      .toISOString()
      .split("T")[0],
    toDate: new Date().toISOString().split("T")[0],
  });

  const [reportData, setReportData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Fetch report data
  useEffect(() => {
    const fetchReport = async () => {
      try {
        setLoading(true);
        setError("");

        const params = new URLSearchParams({
          fromDate: filters.fromDate,
          toDate: filters.toDate,
          ...(filters.customerId && { customerId: filters.customerId }),
          ...(filters.productId && { productId: filters.productId }),
          ...(filters.status && { status: filters.status }),
          limit: "100",
          skip: "0",
        });

        const response = await api.get(`/reports/${filters.reportType}?${params}`);
        setReportData(response);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load report");
        console.error("Report error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchReport();
  }, [filters.reportType, filters.fromDate, filters.toDate, filters.customerId, filters.productId, filters.status]);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(value);
  };

  const handleExport = async () => {
    try {
      if (!reportData) return;

      const reportName = filters.reportType.toUpperCase();
      let csvContent = `${reportName} Report\nFrom: ${filters.fromDate} To: ${filters.toDate}\n\n`;

      // Export summary
      if (reportData.summary) {
        csvContent += "SUMMARY\n";
        csvContent += Object.entries(reportData.summary)
          .map(([key, value]) => `${key},${value}`)
          .join("\n");
        csvContent += "\n\n";
      }

      // Export detailed data based on report type
      const dataKey =
        filters.reportType === "sales"
          ? "detailedInvoices"
          : filters.reportType === "purchase"
            ? "detailedPurchases"
            : filters.reportType === "payment"
              ? "detailedPayments"
              : null;

      if (dataKey && reportData[dataKey]) {
        csvContent += "DETAILED DATA\n";
        const headers = Object.keys(reportData[dataKey][0] || {});
        csvContent += headers.join(",") + "\n";
        csvContent += reportData[dataKey]
          .map((row: any) => headers.map((h) => `"${row[h] || ""}"`).join(","))
          .join("\n");
      }

      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
      const link = document.createElement("a");
      const url = URL.createObjectURL(blob);
      link.setAttribute("href", url);
      link.setAttribute("download", `${reportName}-${filters.fromDate}-to-${filters.toDate}.csv`);
      link.style.visibility = "hidden";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) {
      alert("Failed to export report");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Business Reports</h1>
        <p className="mt-2 text-sm text-gray-600">
          Comprehensive analytics and insights from your business data
        </p>
      </div>

      <FilterPanel
        filters={filters}
        onFilterChange={setFilters}
        onExport={handleExport}
        loading={loading}
      />

      {error && (
        <div className="mb-6 rounded-lg bg-red-50 border border-red-200 p-4 text-red-700">
          {error}
        </div>
      )}

      {/* SALES REPORT */}
      {filters.reportType === "sales" && reportData && (
        <>
          <div className="mb-6 grid gap-4 md:grid-cols-4">
            <StatCard
              title="Total Sales"
              value={formatCurrency(reportData.summary?.totalSales || 0)}
              icon={<DollarSign />}
              color="bg-emerald-500"
            />
            <StatCard
              title="Invoices"
              value={reportData.summary?.totalInvoices || 0}
              subtitle={`Avg: ${formatCurrency(reportData.summary?.averageInvoiceValue || 0)}`}
              icon={<TrendingUp />}
              color="bg-blue-500"
            />
            <StatCard
              title="Paid Amount"
              value={formatCurrency(reportData.summary?.paidAmount || 0)}
              icon={<CreditCard />}
              color="bg-green-500"
            />
            <StatCard
              title="Pending"
              value={formatCurrency(reportData.summary?.pendingAmount || 0)}
              subtitle={`${((reportData.summary?.pendingAmount / (reportData.summary?.totalSales || 1)) * 100).toFixed(1)}% of total`}
              icon={<Calendar />}
              color="bg-orange-500"
            />
          </div>

          <div className="mb-6 grid gap-6 lg:grid-cols-2">
            {/* Sales by Status Chart */}
            {reportData.byStatus && reportData.byStatus.length > 0 && (
              <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
                <h3 className="mb-4 text-lg font-semibold text-gray-900">Sales by Status</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={reportData.byStatus}
                      dataKey="amount"
                      nameKey="_id"
                      cx="50%"
                      cy="50%"
                      outerRadius={100}
                      label
                    >
                      {reportData.byStatus.map((_: unknown, index: number) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => formatCurrency(value as number)} />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            )}

            {/* Sales Trend Chart */}
            {reportData.byDate && reportData.byDate.length > 0 && (
              <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
                <h3 className="mb-4 text-lg font-semibold text-gray-900">Sales Trend</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={reportData.byDate}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="_id" />
                    <YAxis />
                    <Tooltip formatter={(value) => formatCurrency(value as number)} />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="totalSales"
                      stroke="#10b981"
                      name="Total Sales"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>

          {/* Top Customers */}
          {reportData.topCustomers && reportData.topCustomers.length > 0 && (
            <div className="mb-6 rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
              <h3 className="mb-4 text-lg font-semibold text-gray-900">Top Customers</h3>
              <DataTable
                columns={[
                  { key: "_id", label: "Customer" },
                  { key: "totalAmount", label: "Total Amount", format: (v) => formatCurrency(v) },
                  { key: "invoiceCount", label: "Invoices" },
                  { key: "lastInvoiceDate", label: "Last Invoice" },
                ]}
                data={reportData.topCustomers}
                loading={loading}
              />
            </div>
          )}
        </>
      )}

      {/* PURCHASE REPORT */}
      {filters.reportType === "purchase" && reportData && (
        <>
          <div className="mb-6 grid gap-4 md:grid-cols-4">
            <StatCard
              title="Total Purchases"
              value={formatCurrency(reportData.summary?.totalPurchases || 0)}
              icon={<DollarSign />}
              color="bg-blue-500"
            />
            <StatCard
              title="Orders"
              value={reportData.summary?.totalOrders || 0}
              subtitle={`Avg: ${formatCurrency(reportData.summary?.averageOrderValue || 0)}`}
              icon={<Package />}
              color="bg-purple-500"
            />
            <StatCard
              title="Total Tax"
              value={formatCurrency(reportData.summary?.totalTax || 0)}
              icon={<Percent />}
              color="bg-yellow-500"
            />
            <StatCard
              title="Total Discount"
              value={formatCurrency(reportData.summary?.totalDiscount || 0)}
              icon={<TrendingUp />}
              color="bg-pink-500"
            />
          </div>

          {reportData.byDate && reportData.byDate.length > 0 && (
            <div className="mb-6 rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
              <h3 className="mb-4 text-lg font-semibold text-gray-900">Purchase Trend</h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={reportData.byDate}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="_id" />
                  <YAxis />
                  <Tooltip formatter={(value) => formatCurrency(value as number)} />
                  <Legend />
                  <Bar dataKey="totalPurchases" fill="#3b82f6" name="Total Purchases" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </>
      )}

      {/* INVENTORY REPORT */}
      {filters.reportType === "inventory" && reportData && (
        <>
          <div className="mb-6 grid gap-4 md:grid-cols-4">
            <StatCard
              title="Total Products"
              value={reportData.summary?.totalProducts || 0}
              icon={<Package />}
              color="bg-emerald-500"
            />
            <StatCard
              title="Low Stock Items"
              value={reportData.summary?.lowStockCount || 0}
              subtitle={`${((reportData.summary?.lowStockCount / (reportData.summary?.totalProducts || 1)) * 100).toFixed(1)}% of inventory`}
              icon={<TrendingUp />}
              color="bg-red-500"
            />
            <StatCard
              title="Total Stock Value"
              value={formatCurrency(reportData.summary?.totalStockValue || 0)}
              icon={<DollarSign />}
              color="bg-blue-500"
            />
            <StatCard
              title="Active Products"
              value={reportData.summary?.activeProducts || 0}
              icon={<Package />}
              color="bg-green-500"
            />
          </div>

          {reportData.lowStockProducts && reportData.lowStockProducts.length > 0 && (
            <div className="mb-6 rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
              <h3 className="mb-4 text-lg font-semibold text-gray-900">Low Stock Alert</h3>
              <DataTable
                columns={[
                  { key: "productName", label: "Product" },
                  { key: "currentStock", label: "Current Stock" },
                  { key: "minStock", label: "Min Stock" },
                  { key: "shortage", label: "Shortage" },
                  { key: "category", label: "Category" },
                ]}
                data={reportData.lowStockProducts}
                loading={loading}
              />
            </div>
          )}
        </>
      )}

      {/* CUSTOMER REPORT */}
      {filters.reportType === "customer" && reportData && (
        <>
          <div className="mb-6 grid gap-4 md:grid-cols-4">
            <StatCard
              title="Total Customers"
              value={reportData.summary?.totalCustomers || 0}
              icon={<Users />}
              color="bg-emerald-500"
            />
            <StatCard
              title="Active Customers"
              value={reportData.summary?.activeCount || 0}
              icon={<Users />}
              color="bg-green-500"
            />
            <StatCard
              title="Outstanding"
              value={formatCurrency(reportData.summary?.totalOpeningBalance || 0)}
              icon={<DollarSign />}
              color="bg-red-500"
            />
            <StatCard
              title="Credit Limit"
              value={formatCurrency(reportData.summary?.totalCreditLimit || 0)}
              icon={<CreditCard />}
              color="bg-blue-500"
            />
          </div>

          {reportData.topCustomers && reportData.topCustomers.length > 0 && (
            <div className="mb-6 rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
              <h3 className="mb-4 text-lg font-semibold text-gray-900">Top Customers</h3>
              <DataTable
                columns={[
                  { key: "_id", label: "Customer" },
                  { key: "totalSales", label: "Total Sales", format: (v) => formatCurrency(v) },
                  { key: "totalInvoices", label: "Invoices" },
                  { key: "pendingAmount", label: "Pending", format: (v) => formatCurrency(v) },
                ]}
                data={reportData.topCustomers}
                loading={loading}
              />
            </div>
          )}
        </>
      )}

      {/* PAYMENT REPORT */}
      {filters.reportType === "payment" && reportData && (
        <>
          <div className="mb-6 grid gap-4 md:grid-cols-4">
            <StatCard
              title="Total Payments"
              value={formatCurrency(reportData.summary?.totalPayments || 0)}
              icon={<CreditCard />}
              color="bg-emerald-500"
            />
            <StatCard
              title="Transactions"
              value={reportData.summary?.totalTransactions || 0}
              subtitle={`Avg: ${formatCurrency(reportData.summary?.averagePayment || 0)}`}
              icon={<DollarSign />}
              color="bg-blue-500"
            />
            <StatCard
              title="Max Payment"
              value={formatCurrency(reportData.summary?.maxPayment || 0)}
              icon={<TrendingUp />}
              color="bg-green-500"
            />
            <StatCard
              title="Min Payment"
              value={formatCurrency(reportData.summary?.minPayment || 0)}
              icon={<TrendingUp />}
              color="bg-orange-500"
            />
          </div>

          {reportData.byPaymentMode && reportData.byPaymentMode.length > 0 && (
            <div className="mb-6 grid gap-6 lg:grid-cols-2">
              <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
                <h3 className="mb-4 text-lg font-semibold text-gray-900">By Payment Mode</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={reportData.byPaymentMode}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="_id" />
                    <YAxis />
                    <Tooltip formatter={(value) => formatCurrency(value as number)} />
                    <Bar dataKey="totalAmount" fill="#10b981" name="Amount" />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
                <h3 className="mb-4 text-lg font-semibold text-gray-900">Payment Methods</h3>
                <DataTable
                  columns={[
                    { key: "_id", label: "Mode" },
                    { key: "totalAmount", label: "Total", format: (v) => formatCurrency(v) },
                    { key: "count", label: "Count" },
                    { key: "averageAmount", label: "Avg", format: (v) => formatCurrency(v) },
                  ]}
                  data={reportData.byPaymentMode}
                  loading={loading}
                />
              </div>
            </div>
          )}
        </>
      )}

      {/* GST REPORT */}
      {filters.reportType === "gst" && reportData && (
        <>
          <div className="mb-6 grid gap-4 md:grid-cols-4">
            <StatCard
              title="Sales GST"
              value={formatCurrency(reportData.summary?.totalSalesGST || 0)}
              icon={<Percent />}
              color="bg-emerald-500"
            />
            <StatCard
              title="Purchase GST"
              value={formatCurrency(reportData.summary?.totalPurchaseGST || 0)}
              icon={<Percent />}
              color="bg-blue-500"
            />
            <StatCard
              title="GST Payable"
              value={formatCurrency(reportData.summary?.netGSTPayable || 0)}
              icon={<DollarSign />}
              color="bg-orange-500"
            />
            <StatCard
              title="GST Refundable"
              value={formatCurrency(reportData.summary?.netGSTRefundable || 0)}
              icon={<DollarSign />}
              color="bg-green-500"
            />
          </div>
        </>
      )}

      {/* PROFIT & LOSS REPORT */}
      {filters.reportType === "profit-loss" && reportData && (
        <>
          <div className="mb-6 grid gap-4 md:grid-cols-4">
            <StatCard
              title="Gross Revenue"
              value={formatCurrency(reportData.revenue?.grossRevenue || 0)}
              icon={<TrendingUp />}
              color="bg-emerald-500"
            />
            <StatCard
              title="Cost of Sales"
              value={formatCurrency(reportData.costOfSales?.totalCost || 0)}
              icon={<DollarSign />}
              color="bg-red-500"
            />
            <StatCard
              title="Gross Profit"
              value={formatCurrency(reportData.profitAnalysis?.grossProfit || 0)}
              icon={<TrendingUp />}
              color="bg-blue-500"
            />
            <StatCard
              title="Profit Margin"
              value={`${reportData.profitAnalysis?.grossProfitMargin || 0}%`}
              icon={<Percent />}
              color="bg-green-500"
            />
          </div>

          <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
            <h3 className="mb-6 text-lg font-semibold text-gray-900">Income Statement</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b pb-4">
                <span className="text-gray-700">Gross Revenue</span>
                <span className="font-semibold">{formatCurrency(reportData.revenue?.grossRevenue || 0)}</span>
              </div>
              <div className="flex items-center justify-between border-b pb-4">
                <span className="text-gray-700">Less: Discounts</span>
                <span className="font-semibold">({formatCurrency(reportData.revenue?.discounts || 0)})</span>
              </div>
              <div className="flex items-center justify-between border-b pb-4">
                <span className="text-gray-700">Net Revenue</span>
                <span className="font-semibold">{formatCurrency(reportData.revenue?.netRevenue || 0)}</span>
              </div>
              <div className="flex items-center justify-between border-b pb-4">
                <span className="text-gray-700">Less: Cost of Sales</span>
                <span className="font-semibold">({formatCurrency(reportData.costOfSales?.totalCost || 0)})</span>
              </div>
              <div className="flex items-center justify-between bg-emerald-50 p-4 rounded-lg">
                <span className="font-semibold text-gray-900">Gross Profit</span>
                <span className="text-lg font-bold text-emerald-600">
                  {formatCurrency(reportData.profitAnalysis?.grossProfit || 0)}
                </span>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
