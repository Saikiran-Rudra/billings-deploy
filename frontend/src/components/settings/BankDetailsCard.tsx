'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Company } from '@/types';
import { Edit2, Save, X, Loader, AlertCircle } from 'lucide-react';
import { bankDetailsSchema, type BankDetailsInput } from '@/lib/validations/company-settings';
import { INDIAN_BANKS } from '@/constants/indian-banks';

interface BankDetailsCardProps {
  company: Company;
  onSave?: (data: any) => Promise<void>;
}

// Helper function to mask account number
const maskAccountNumber = (accountNumber: string): string => {
  if (!accountNumber || accountNumber.length < 4) return accountNumber;
  const last4 = accountNumber.slice(-4);
  return `****${last4}`;
};

export function BankDetailsCard({ company, onSave }: BankDetailsCardProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const bankInfo = company?.bankInfo || {};
  const isEmpty = !bankInfo.bankName;

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<BankDetailsInput>({
    resolver: zodResolver(bankDetailsSchema),
    mode: 'onChange',
    defaultValues: {
      bankInfo: {
        bankName: bankInfo.bankName || '',
        accountHolder: bankInfo.accountHolder || '',
        accountNumber: bankInfo.accountNumber || '',
        ifscCode: bankInfo.ifscCode || '',
        branchName: bankInfo.branchName || '',
      },
    },
  });

  const onSubmit = async (data: BankDetailsInput) => {
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

  if (isEditing) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold text-gray-900">Bank Details</h2>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Bank Name <span className="text-red-500">*</span>
            </label>
            <select
              {...register('bankInfo.bankName')}
              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.bankInfo?.bankName ? 'border-red-500' : 'border-gray-300'
              }`}
              disabled={isSaving}
            >
              <option value="">Select bank</option>
              {INDIAN_BANKS.map((bank) => (
                <option key={bank.value} value={bank.value}>
                  {bank.label}
                </option>
              ))}
            </select>
            {errors.bankInfo?.bankName && (
              <div className="flex items-center gap-2 mt-1 text-sm text-red-600">
                <AlertCircle className="w-4 h-4" />
                {errors.bankInfo.bankName.message}
              </div>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Account Holder Name <span className="text-red-500">*</span>
            </label>
            <input
              {...register('bankInfo.accountHolder')}
              type="text"
              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.bankInfo?.accountHolder ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="Name on bank account"
              disabled={isSaving}
            />
            {errors.bankInfo?.accountHolder && (
              <div className="flex items-center gap-2 mt-1 text-sm text-red-600">
                <AlertCircle className="w-4 h-4" />
                {errors.bankInfo.accountHolder.message}
              </div>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Account Number <span className="text-red-500">*</span>
            </label>
            <input
              {...register('bankInfo.accountNumber')}
              type="text"
              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.bankInfo?.accountNumber ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="Enter account number (9-18 digits)"
              disabled={isSaving}
            />
            {errors.bankInfo?.accountNumber && (
              <div className="flex items-center gap-2 mt-1 text-sm text-red-600">
                <AlertCircle className="w-4 h-4" />
                {errors.bankInfo.accountNumber.message}
              </div>
            )}
            <p className="text-xs text-gray-500 mt-1">Your account number will be securely stored</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              IFSC Code <span className="text-red-500">*</span>
            </label>
            <input
              {...register('bankInfo.ifscCode')}
              type="text"
              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.bankInfo?.ifscCode ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="e.g., HDFC0000123"
              maxLength={11}
              disabled={isSaving}
            />
            {errors.bankInfo?.ifscCode && (
              <div className="flex items-center gap-2 mt-1 text-sm text-red-600">
                <AlertCircle className="w-4 h-4" />
                {errors.bankInfo.ifscCode.message}
              </div>
            )}
            <p className="text-xs text-gray-500 mt-1">11-character IFSC code (format: SBIN0001234)</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Branch Name <span className="text-red-500">*</span>
            </label>
            <input
              {...register('bankInfo.branchName')}
              type="text"
              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.bankInfo?.branchName ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="e.g., Fort, Mumbai"
              disabled={isSaving}
            />
            {errors.bankInfo?.branchName && (
              <div className="flex items-center gap-2 mt-1 text-sm text-red-600">
                <AlertCircle className="w-4 h-4" />
                {errors.bankInfo.branchName.message}
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

  if (isEmpty) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold text-gray-900">Bank Details</h2>
        </div>
        <div className="text-center py-8">
          <p className="text-gray-600 mb-4">No bank account added yet</p>
          {onSave && (
            <button
              onClick={() => setIsEditing(true)}
              className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Edit2 className="w-4 h-4" />
              Add Bank Details
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
      <div className="flex items-start justify-between mb-6">
        <h2 className="text-lg font-semibold text-gray-900">Bank Details</h2>
        {onSave && (
          <button
            onClick={() => setIsEditing(true)}
            className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors flex items-center gap-2"
            aria-label="Edit bank details"
          >
            <Edit2 className="w-4 h-4" />
          </button>
        )}
      </div>

      <div className="space-y-4">
        {bankInfo.bankName && (
          <div>
            <label className="text-sm font-medium text-gray-600">Bank Name</label>
            <p className="text-gray-900 mt-1">{bankInfo.bankName}</p>
          </div>
        )}

        {bankInfo.accountHolder && (
          <div>
            <label className="text-sm font-medium text-gray-600">Account Holder</label>
            <p className="text-gray-900 mt-1">{bankInfo.accountHolder}</p>
          </div>
        )}

        {bankInfo.accountNumber && (
          <div>
            <label className="text-sm font-medium text-gray-600">Account Number</label>
            <p className="text-gray-900 mt-1 font-mono">{maskAccountNumber(bankInfo.accountNumber)}</p>
          </div>
        )}

        {bankInfo.ifscCode && (
          <div>
            <label className="text-sm font-medium text-gray-600">IFSC Code</label>
            <p className="text-gray-900 mt-1 font-mono">{bankInfo.ifscCode}</p>
          </div>
        )}

        {bankInfo.branchName && (
          <div>
            <label className="text-sm font-medium text-gray-600">Branch</label>
            <p className="text-gray-900 mt-1">{bankInfo.branchName}</p>
          </div>
        )}
      </div>
    </div>
  );
}
