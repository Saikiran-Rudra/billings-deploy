'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Company } from '@/types';
import { Edit2, Save, X, Loader, AlertCircle } from 'lucide-react';
import { BUSINESS_TYPES, INDUSTRIES } from '@/constants/indian-banks';
import { companyDetailsSchema, type CompanyDetailsInput } from '@/lib/validations/company-settings';

interface CompanyOverviewCardProps {
  company: Company;
  onSave?: (data: any) => Promise<void>;
}

export function CompanyOverviewCard({ company, onSave }: CompanyOverviewCardProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<CompanyDetailsInput>({
    resolver: zodResolver(companyDetailsSchema),
    defaultValues: {
      name: company?.name || '',
      businessInfo: {
        businessType: company?.businessInfo?.businessType || '',
        industry: company?.businessInfo?.industry || '',
        businessAddress: company?.businessInfo?.businessAddress || '',
      },
    },
  });

  const onSubmit = async (data: CompanyDetailsInput) => {
    try {
      setIsSaving(true);
      await onSave?.(data);
      setIsEditing(false);
    } catch (err) {
      console.error('Failed to save:', err);
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    reset();
    setIsEditing(false);
  };

  const getPlanBadgeColor = (plan: string) => {
    switch (plan) {
      case 'trial':
        return 'bg-blue-100 text-blue-800';
      case 'pro':
        return 'bg-purple-100 text-purple-800';
      case 'professional':
        return 'bg-purple-100 text-purple-800';
      case 'enterprise':
        return 'bg-indigo-100 text-indigo-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'inactive':
        return 'bg-red-100 text-red-800';
      case 'archived':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (isEditing) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold text-gray-900">Company Overview</h2>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Company Name <span className="text-red-500">*</span>
            </label>
            <input
              {...register('name')}
              type="text"
              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.name ? 'border-red-500' : 'border-gray-300'
              }`}
              disabled={isSaving}
            />
            {errors.name && (
              <div className="flex items-center gap-2 mt-1 text-sm text-red-600">
                <AlertCircle className="w-4 h-4" />
                {errors.name.message}
              </div>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Business Type <span className="text-red-500">*</span>
            </label>
            <select
              {...register('businessInfo.businessType')}
              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.businessInfo?.businessType ? 'border-red-500' : 'border-gray-300'
              }`}
              disabled={isSaving}
            >
              <option value="">Select business type</option>
              {BUSINESS_TYPES.map((type) => (
                <option key={type.value} value={type.value}>
                  {type.label}
                </option>
              ))}
            </select>
            {errors.businessInfo?.businessType && (
              <div className="flex items-center gap-2 mt-1 text-sm text-red-600">
                <AlertCircle className="w-4 h-4" />
                {errors.businessInfo.businessType.message}
              </div>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Industry <span className="text-red-500">*</span>
            </label>
            <select
              {...register('businessInfo.industry')}
              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.businessInfo?.industry ? 'border-red-500' : 'border-gray-300'
              }`}
              disabled={isSaving}
            >
              <option value="">Select industry</option>
              {INDUSTRIES.map((ind) => (
                <option key={ind.value} value={ind.value}>
                  {ind.label}
                </option>
              ))}
            </select>
            {errors.businessInfo?.industry && (
              <div className="flex items-center gap-2 mt-1 text-sm text-red-600">
                <AlertCircle className="w-4 h-4" />
                {errors.businessInfo.industry.message}
              </div>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Business Address <span className="text-red-500">*</span>
            </label>
            <textarea
              {...register('businessInfo.businessAddress')}
              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.businessInfo?.businessAddress ? 'border-red-500' : 'border-gray-300'
              }`}
              rows={3}
              disabled={isSaving}
            />
            {errors.businessInfo?.businessAddress && (
              <div className="flex items-center gap-2 mt-1 text-sm text-red-600">
                <AlertCircle className="w-4 h-4" />
                {errors.businessInfo.businessAddress.message}
              </div>
            )}
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={handleCancel}
              disabled={isSaving}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
            >
              <X className="w-4 h-4" />
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="flex-1 px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {isSaving ? (
                <>
                  <Loader className="w-4 h-4 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  Save Changes
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
      <div className="flex items-start justify-between mb-6">
        <h2 className="text-lg font-semibold text-gray-900">Company Overview</h2>
        {onSave && (
          <button
            onClick={() => setIsEditing(true)}
            className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors flex items-center gap-2"
            aria-label="Edit company"
          >
            <Edit2 className="w-4 h-4" />
          </button>
        )}
      </div>

      <div className="grid grid-cols-3 gap-6">
        <div className="col-span-2 space-y-4">
          <div>
            <label className="text-sm font-medium text-gray-600">Company Name</label>
            <p className="text-lg font-semibold text-gray-900 mt-1">{company.name}</p>
          </div>

          {company?.businessInfo?.businessType && (
            <div>
              <label className="text-sm font-medium text-gray-600">Business Type</label>
              <p className="text-gray-900 mt-1">{company.businessInfo.businessType}</p>
            </div>
          )}

          {company?.businessInfo?.businessAddress && (
            <div>
              <label className="text-sm font-medium text-gray-600">Business Address</label>
              <p className="text-gray-900 mt-1 whitespace-pre-wrap">{company.businessInfo.businessAddress}</p>
            </div>
          )}
        </div>

        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium text-gray-600">Plan</label>
            <div className="mt-2">
              <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getPlanBadgeColor(company.plan)}`}>
                {company.plan.charAt(0).toUpperCase() + company.plan.slice(1)}
              </span>
            </div>
          </div>

          {company?.businessInfo?.industry && (
            <div>
              <label className="text-sm font-medium text-gray-600">Industry</label>
              <p className="text-gray-900 mt-1">{company.businessInfo.industry}</p>
            </div>
          )}

          <div>
            <label className="text-sm font-medium text-gray-600">Status</label>
            <div className="mt-2">
              <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusBadgeColor(company.status)}`}>
                {company.status.charAt(0).toUpperCase() + company.status.slice(1)}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
