"use client";

import { useState, useEffect } from "react";
import { Key, Calendar, DollarSign, CheckCircle, AlertCircle } from "lucide-react";

export default function LicensesPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [licenses, setLicenses] = useState<any[]>([]);

  useEffect(() => {
    setTimeout(() => {
      setLicenses([
        {
          id: "1",
          company: "Tech Innovations Ltd",
          type: "Professional",
          status: "active",
          startDate: "2024-01-15",
          endDate: "2025-01-15",
          price: "₹4,999",
          users: 12,
          renewalDate: "2024-12-15",
        },
        {
          id: "2",
          company: "Fashion Forward Inc",
          type: "Enterprise",
          status: "active",
          startDate: "2024-02-10",
          endDate: "2025-02-10",
          price: "₹9,999",
          users: 28,
          renewalDate: "2025-01-10",
        },
        {
          id: "3",
          company: "GreenEnergy Solutions",
          type: "Starter",
          status: "expiring-soon",
          startDate: "2024-03-05",
          endDate: "2024-09-05",
          price: "₹1,999",
          users: 5,
          renewalDate: "2024-08-05",
        },
        {
          id: "4",
          company: "Digital Marketing Pro",
          type: "Professional",
          status: "active",
          startDate: "2024-01-20",
          endDate: "2025-01-20",
          price: "₹4,999",
          users: 18,
          renewalDate: "2024-12-20",
        },
      ]);
      setIsLoading(false);
    }, 800);
  }, []);

  const getStatusBadge = (status: string) => {
    const colors: { [key: string]: string } = {
      active: "bg-green-100 text-green-800",
      "expiring-soon": "bg-yellow-100 text-yellow-800",
      expired: "bg-red-100 text-red-800",
    };
    return colors[status] || "bg-gray-100 text-gray-800";
  };

  const getStatusIcon = (status: string) => {
    return status === "active" ? (
      <CheckCircle size={16} className="text-green-600" />
    ) : (
      <AlertCircle size={16} className="text-yellow-600" />
    );
  };

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="space-y-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="bg-white rounded-lg p-4 animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-48 mb-2" />
              <div className="h-4 bg-gray-200 rounded w-96" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 mb-2">
          <Key size={32} className="text-green-600" />
          <h1 className="text-3xl font-bold text-gray-900">Licenses & Subscriptions</h1>
        </div>
        <p className="text-gray-600">Manage all active licenses and subscriptions</p>
      </div>

      {/* Stats Bar */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-lg p-4 border border-gray-200">
          <p className="text-sm text-gray-600">Total Licenses</p>
          <p className="text-2xl font-bold text-gray-900 mt-2">{licenses.length}</p>
        </div>
        <div className="bg-white rounded-lg p-4 border border-gray-200">
          <p className="text-sm text-gray-600">Active</p>
          <p className="text-2xl font-bold text-green-600 mt-2">
            {licenses.filter((l) => l.status === "active").length}
          </p>
        </div>
        <div className="bg-white rounded-lg p-4 border border-gray-200">
          <p className="text-sm text-gray-600">Expiring Soon</p>
          <p className="text-2xl font-bold text-yellow-600 mt-2">
            {licenses.filter((l) => l.status === "expiring-soon").length}
          </p>
        </div>
      </div>

      {/* Licenses Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50">
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Company</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Plan Type</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Price</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Users</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Start Date</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">End Date</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {licenses.map((license) => (
                <tr key={license.id} className="hover:bg-gray-50 transition">
                  <td className="px-6 py-4">
                    <p className="font-medium text-gray-900">{license.company}</p>
                  </td>
                  <td className="px-6 py-4">
                    <span className="px-3 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                      {license.type}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <DollarSign size={16} className="text-gray-400" />
                      {license.price}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-gray-900">{license.users}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <Calendar size={16} className="text-gray-400" />
                      {license.startDate}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-gray-600">{license.endDate}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      {getStatusIcon(license.status)}
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusBadge(license.status)}`}>
                        {license.status}
                      </span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
