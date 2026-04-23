'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Company } from '@/types';
import { X, Loader } from 'lucide-react';

interface EditTaxInfoModalProps {
  company: Company;
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: any) => Promise<void>;
}

interface TaxInfoFormData {
  gstNumber?: string;
  panNumber?: string;
  financialYearStart?: string;
}

export function EditTaxInfoModal({
  company,
  isOpen,
  onClose,
  onSave,
}: EditTaxInfoModalProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<TaxInfoFormData>({
    defaultValues: {
      gstNumber: company?.taxInfo?.gstNumber || '',
      panNumber: company?.taxInfo?.panNumber || '',
      financialYearStart: company?.taxInfo?.financialYearStart || '',
    },
  });

  const onSubmit = async (data: TaxInfoFormData) => {
    try {
      setError(null);
      setIsLoading(true);
      await onSave({
        taxInfo: {
          gstNumber: data.gstNumber,
          panNumber: data.panNumber,
          financialYearStart: data.financialYearStart,
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
      <div className="bg-white rounded-xl shadow-lg w-full max-w-md p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-gray-900">Edit Tax Information</h2>
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
              GST Registration Number (GSTIN)
            </label>
            <input
              {...register('gstNumber')}
              type="text"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="e.g., 27AAPFU0192F1Z5"
              maxLength={15}
              disabled={isLoading}
            />
            {errors.gstNumber && (
              <p className="text-sm text-red-600 mt-1">{errors.gstNumber.message}</p>
            )}
            <p className="text-xs text-gray-500 mt-1">15-digit GST identification number</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              PAN Number
            </label>
            <input
              {...register('panNumber')}
              type="text"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="e.g., AAAAA0000A"
              maxLength={10}
              disabled={isLoading}
            />
            {errors.panNumber && (
              <p className="text-sm text-red-600 mt-1">{errors.panNumber.message}</p>
            )}
            <p className="text-xs text-gray-500 mt-1">10-character PAN</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Financial Year Start (Date)
            </label>
            <input
              {...register('financialYearStart')}
              type="date"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={isLoading}
            />
            {errors.financialYearStart && (
              <p className="text-sm text-red-600 mt-1">{errors.financialYearStart.message}</p>
            )}
            <p className="text-xs text-gray-500 mt-1">e.g., April 1st for Indian financial year</p>
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
