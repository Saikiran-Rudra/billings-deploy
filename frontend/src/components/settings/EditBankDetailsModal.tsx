'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Company } from '@/types';
import { X, Loader } from 'lucide-react';

interface EditBankDetailsModalProps {
  company: Company;
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: any) => Promise<void>;
}

interface BankDetailsFormData {
  bankName?: string;
  accountHolder?: string;
  accountNumber?: string;
  ifscCode?: string;
  branchName?: string;
}

export function EditBankDetailsModal({
  company,
  isOpen,
  onClose,
  onSave,
}: EditBankDetailsModalProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<BankDetailsFormData>({
    defaultValues: {
      bankName: company?.bankInfo?.bankName || '',
      accountHolder: company?.bankInfo?.accountHolder || '',
      accountNumber: company?.bankInfo?.accountNumber || '',
      ifscCode: company?.bankInfo?.ifscCode || '',
      branchName: company?.bankInfo?.branchName || '',
    },
  });

  const onSubmit = async (data: BankDetailsFormData) => {
    try {
      setError(null);
      setIsLoading(true);
      await onSave({
        bankInfo: {
          bankName: data.bankName,
          accountHolder: data.accountHolder,
          accountNumber: data.accountNumber,
          ifscCode: data.ifscCode,
          branchName: data.branchName,
        },
      });
      reset();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save changes');
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-lg w-full max-w-md p-6 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-gray-900">Edit Bank Details</h2>
          <button
            onClick={onClose}
            disabled={isLoading}
            className="text-gray-400 hover:text-gray-600 disabled:opacity-50"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-800 rounded-lg text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Bank Name
            </label>
            <input
              {...register('bankName')}
              type="text"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="e.g., HDFC Bank"
              disabled={isLoading}
            />
            {errors.bankName && (
              <p className="text-sm text-red-600 mt-1">{errors.bankName.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Account Holder Name
            </label>
            <input
              {...register('accountHolder')}
              type="text"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Name on bank account"
              disabled={isLoading}
            />
            {errors.accountHolder && (
              <p className="text-sm text-red-600 mt-1">{errors.accountHolder.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Account Number
            </label>
            <input
              {...register('accountNumber')}
              type="text"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter account number"
              disabled={isLoading}
            />
            {errors.accountNumber && (
              <p className="text-sm text-red-600 mt-1">{errors.accountNumber.message}</p>
            )}
            <p className="text-xs text-gray-500 mt-1">Your account number will be securely stored</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              IFSC Code
            </label>
            <input
              {...register('ifscCode')}
              type="text"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="e.g., HDFC0000123"
              maxLength={11}
              disabled={isLoading}
            />
            {errors.ifscCode && (
              <p className="text-sm text-red-600 mt-1">{errors.ifscCode.message}</p>
            )}
            <p className="text-xs text-gray-500 mt-1">11-character IFSC code</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Branch Name
            </label>
            <input
              {...register('branchName')}
              type="text"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="e.g., Fort, Mumbai"
              disabled={isLoading}
            />
            {errors.branchName && (
              <p className="text-sm text-red-600 mt-1">{errors.branchName.message}</p>
            )}
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              disabled={isLoading}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="flex-1 px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <Loader className="w-4 h-4 animate-spin" />
                  Saving...
                </>
              ) : (
                'Save Changes'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
