'use client';

import { Company } from '@/types';
import { Briefcase, Package, BarChart3, ShoppingCart, DollarSign, Sparkles, Lightbulb } from 'lucide-react';

interface ModulesCardProps {
  company: Company;
}

const MODULE_ICONS: Record<string, React.ReactNode> = {
  sales: <Briefcase className="w-6 h-6" />,
  inventory: <Package className="w-6 h-6" />,
  accounting: <BarChart3 className="w-6 h-6" />,
  purchases: <ShoppingCart className="w-6 h-6" />,
  expenses: <DollarSign className="w-6 h-6" />,
};

const MODULE_INFO: Record<string, { label: string; description: string }> = {
  sales: {
    label: 'Sales',
    description: 'Manage invoices and sales transactions',
  },
  inventory: {
    label: 'Inventory',
    description: 'Track products and stock levels',
  },
  accounting: {
    label: 'Accounting',
    description: 'Financial records and reporting',
  },
  purchases: {
    label: 'Purchases',
    description: 'Manage purchase orders and vendors',
  },
  expenses: {
    label: 'Expenses',
    description: 'Track business expenses',
  },
};

export function ModulesCard({ company }: ModulesCardProps) {
  const enabledModules = company.modules || [];

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
      <h2 className="text-lg font-semibold text-gray-900 mb-6">Modules</h2>

      {enabledModules.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-gray-500">No modules enabled</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {enabledModules.map((module) => {
            const info = MODULE_INFO[module as keyof typeof MODULE_INFO];
            const icon = MODULE_ICONS[module as keyof typeof MODULE_ICONS] || <Sparkles className="w-6 h-6" />;
            return (
              <div
                key={module}
                className="border border-gray-200 rounded-lg p-4 hover:shadow-sm transition-shadow"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <div className="text-blue-600 mb-2">{icon}</div>
                    <h3 className="font-semibold text-gray-900">{info?.label || module}</h3>
                    <p className="text-sm text-gray-600 mt-1">{info?.description}</p>
                  </div>
                </div>
                <div className="mt-3">
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    Enabled
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
        <div className="flex gap-3">
          <Lightbulb className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-blue-900">
            <span className="font-medium">Upgrade your plan</span> to enable more modules and advanced features.
          </p>
        </div>
      </div>
    </div>
  );
}
