'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Company } from '@/types';
import { Edit2, Save, X, Loader, AlertCircle } from 'lucide-react';
import DocumentUploadField from '@/components/form/DocumentUploadField';
import { taxInfoSchema, type TaxInfoInput } from '@/lib/validations/company-settings';
import { FINANCIAL_YEAR_START } from '@/constants/indian-banks';
import { handleFileUpload } from '@/services/upload.api';

interface CompanyTaxSavePayload {
  gstStatus: 'YES' | 'NO';
  gstNumber: string;
  gstDocumentUrl: string;
  panNumber: string;
  panDocumentUrl: string;
  financialYearStart: string;
  taxInfo: {
    gstRegistration: 'YES' | 'NO';
    gstin: string;
    panNumber: string;
    financialYearStart: string;
  };
}

interface TaxInfoCardProps {
  company: Company;
  onSave?: (data: CompanyTaxSavePayload) => Promise<void>;
}

export function TaxInfoCard({ company, onSave }: TaxInfoCardProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [uploadingField, setUploadingField] = useState<'gstDocumentUrl' | 'panDocumentUrl' | null>(null);

  const taxInfo = company?.taxInfo || {};
  const currentGstStatus =
    company.gstStatus === 'YES' ||
    company.gstStatus === true ||
    taxInfo.gstStatus === 'YES' ||
    taxInfo.gstRegistration === 'YES'
      ? 'YES'
      : 'NO';
  const isEmpty = !(company.panNumber || taxInfo.panNumber);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    watch,
    setValue,
    clearErrors,
    setError,
  } = useForm<TaxInfoInput>({
    resolver: zodResolver(taxInfoSchema),
    mode: 'onChange',
    defaultValues: {
      taxInfo: {
        gstStatus: currentGstStatus,
        gstNumber: company.gstNumber || taxInfo.gstNumber || taxInfo.gstin || '',
        gstDocumentUrl: company.gstDocumentUrl || taxInfo.gstDocumentUrl || '',
        panNumber: company.panNumber || taxInfo.panNumber || '',
        panDocumentUrl: company.panDocumentUrl || taxInfo.panDocumentUrl || '',
        financialYearStart: company.financialYearStart || taxInfo.financialYearStart || '',
      },
    },
  });

  const gstStatus = watch('taxInfo.gstStatus');
  const gstDocumentUrl = watch('taxInfo.gstDocumentUrl');
  const panDocumentUrl = watch('taxInfo.panDocumentUrl');

  const uploadDocument = async (field: 'gstDocumentUrl' | 'panDocumentUrl', file?: File) => {
    if (!file) {
      return;
    }

    try {
      setUploadingField(field);
      const url = await handleFileUpload(file, field === 'gstDocumentUrl' ? 'gst' : 'pan');
      setValue(`taxInfo.${field}`, url, { shouldValidate: true, shouldDirty: true });
      clearErrors(`taxInfo.${field}`);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Upload failed';
      if (field === 'gstDocumentUrl') {
        setValue('taxInfo.gstDocumentUrl', '', { shouldValidate: true, shouldDirty: true });
        setError('taxInfo.gstDocumentUrl', { type: 'manual', message });
      } else {
        setValue('taxInfo.panDocumentUrl', '', { shouldValidate: true, shouldDirty: true });
        setError('taxInfo.panDocumentUrl', { type: 'manual', message });
      }
    } finally {
      setUploadingField(null);
    }
  };

  const onSubmit = async (data: TaxInfoInput) => {
    try {
      setIsSaving(true);
      await onSave?.({
        gstStatus: data.taxInfo.gstStatus,
        gstNumber: data.taxInfo.gstStatus === 'YES' ? data.taxInfo.gstNumber : '',
        gstDocumentUrl: data.taxInfo.gstStatus === 'YES' ? data.taxInfo.gstDocumentUrl || '' : '',
        panNumber: data.taxInfo.panNumber,
        panDocumentUrl: data.taxInfo.panDocumentUrl,
        financialYearStart: data.taxInfo.financialYearStart,
        taxInfo: {
          gstRegistration: data.taxInfo.gstStatus,
          gstin: data.taxInfo.gstStatus === 'YES' ? data.taxInfo.gstNumber : '',
          panNumber: data.taxInfo.panNumber,
          financialYearStart: data.taxInfo.financialYearStart,
        },
      });
      setIsEditing(false);
    } catch (err) {
      console.error('Failed to save:', err);
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    reset({
      taxInfo: {
        gstStatus: currentGstStatus,
        gstNumber: company.gstNumber || taxInfo.gstNumber || taxInfo.gstin || '',
        gstDocumentUrl: company.gstDocumentUrl || taxInfo.gstDocumentUrl || '',
        panNumber: company.panNumber || taxInfo.panNumber || '',
        panDocumentUrl: company.panDocumentUrl || taxInfo.panDocumentUrl || '',
        financialYearStart: company.financialYearStart || taxInfo.financialYearStart || '',
      },
    });
    setIsEditing(false);
  };

  if (isEditing) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold text-gray-900">Tax Information</h2>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              GST Registration Status <span className="text-red-500">*</span>
            </label>
            <select
              {...register('taxInfo.gstStatus', {
                onChange: (event) => {
                  if (event.target.value === 'NO') {
                    setValue('taxInfo.gstNumber', '', { shouldValidate: true, shouldDirty: true });
                    setValue('taxInfo.gstDocumentUrl', '', { shouldValidate: true, shouldDirty: true });
                    clearErrors(['taxInfo.gstNumber', 'taxInfo.gstDocumentUrl']);
                  }
                },
              })}
              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.taxInfo?.gstStatus ? 'border-red-500' : 'border-gray-300'
              }`}
              disabled={isSaving}
            >
              <option value="YES">YES</option>
              <option value="NO">NO</option>
            </select>
            {errors.taxInfo?.gstStatus && (
              <div className="flex items-center gap-2 mt-1 text-sm text-red-600">
                <AlertCircle className="w-4 h-4" />
                {errors.taxInfo.gstStatus.message}
              </div>
            )}
          </div>

          {gstStatus === 'YES' ? (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  GST Number <span className="text-red-500">*</span>
                </label>
                <input
                  {...register('taxInfo.gstNumber')}
                  type="text"
                  placeholder="e.g., 22ABCDE1234F1Z5"
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.taxInfo?.gstNumber ? 'border-red-500' : 'border-gray-300'
                  }`}
                  disabled={isSaving}
                />
                {errors.taxInfo?.gstNumber && (
                  <div className="flex items-center gap-2 mt-1 text-sm text-red-600">
                    <AlertCircle className="w-4 h-4" />
                    {errors.taxInfo.gstNumber.message}
                  </div>
                )}
              </div>

              <DocumentUploadField
                label="GST Document"
                value={gstDocumentUrl}
                error={errors.taxInfo?.gstDocumentUrl?.message}
                required
                disabled={isSaving}
                isUploading={uploadingField === 'gstDocumentUrl'}
                onChange={(file) => {
                  void uploadDocument('gstDocumentUrl', file);
                }}
                onRemove={() =>
                  setValue('taxInfo.gstDocumentUrl', '', { shouldValidate: true, shouldDirty: true })
                }
              />
            </>
          ) : null}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              PAN Number <span className="text-red-500">*</span>
            </label>
            <input
              {...register('taxInfo.panNumber')}
              type="text"
              placeholder="e.g., ABCDE1234F"
              maxLength={10}
              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.taxInfo?.panNumber ? 'border-red-500' : 'border-gray-300'
              }`}
              disabled={isSaving}
            />
            {errors.taxInfo?.panNumber && (
              <div className="flex items-center gap-2 mt-1 text-sm text-red-600">
                <AlertCircle className="w-4 h-4" />
                {errors.taxInfo.panNumber.message}
              </div>
            )}
          </div>

          <DocumentUploadField
            label="PAN Document"
            value={panDocumentUrl}
            error={errors.taxInfo?.panDocumentUrl?.message}
            required
            disabled={isSaving}
            isUploading={uploadingField === 'panDocumentUrl'}
            onChange={(file) => {
              void uploadDocument('panDocumentUrl', file);
            }}
            onRemove={() =>
              setValue('taxInfo.panDocumentUrl', '', { shouldValidate: true, shouldDirty: true })
            }
          />

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Financial Year Start <span className="text-red-500">*</span>
            </label>
            <select
              {...register('taxInfo.financialYearStart')}
              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.taxInfo?.financialYearStart ? 'border-red-500' : 'border-gray-300'
              }`}
              disabled={isSaving}
            >
              <option value="">Select financial year start</option>
              {FINANCIAL_YEAR_START.map((year) => (
                <option key={year.value} value={year.value}>
                  {year.label}
                </option>
              ))}
            </select>
            {errors.taxInfo?.financialYearStart && (
              <div className="flex items-center gap-2 mt-1 text-sm text-red-600">
                <AlertCircle className="w-4 h-4" />
                {errors.taxInfo.financialYearStart.message}
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
          <h2 className="text-lg font-semibold text-gray-900">Tax Information</h2>
        </div>
        <div className="text-center py-8">
          <p className="text-gray-600 mb-4">No tax information added yet</p>
          {onSave && (
            <button
              onClick={() => setIsEditing(true)}
              className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Edit2 className="w-4 h-4" />
              Add Tax Information
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
      <div className="flex items-start justify-between mb-6">
        <h2 className="text-lg font-semibold text-gray-900">Tax Information</h2>
        {onSave && (
          <button
            onClick={() => setIsEditing(true)}
            className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors flex items-center gap-2"
            aria-label="Edit tax info"
          >
            <Edit2 className="w-4 h-4" />
          </button>
        )}
      </div>

      <div className="space-y-4">
        <div>
          <label className="text-sm font-medium text-gray-600">GST Registration Status</label>
          <p className="text-gray-900 mt-1">{currentGstStatus}</p>
        </div>

        {(company.gstStatus === 'YES' || company.gstStatus === true || taxInfo.gstStatus === 'YES' || taxInfo.gstRegistration === 'YES') && (company.gstNumber || taxInfo.gstNumber || taxInfo.gstin) ? (
          <div>
            <label className="text-sm font-medium text-gray-600">GST Number</label>
            <p className="text-gray-900 mt-1">{company.gstNumber || taxInfo.gstNumber || taxInfo.gstin}</p>
          </div>
        ) : null}

        {(company.gstStatus === 'YES' || company.gstStatus === true || taxInfo.gstStatus === 'YES' || taxInfo.gstRegistration === 'YES') && (company.gstDocumentUrl || taxInfo.gstDocumentUrl) ? (
          <div>
            <label className="text-sm font-medium text-gray-600">GST Document</label>
            <a
              href={company.gstDocumentUrl || taxInfo.gstDocumentUrl}
              target="_blank"
              rel="noreferrer"
              className="mt-1 inline-flex text-blue-700 hover:underline"
            >
              View document
            </a>
          </div>
        ) : null}

        {(company.panNumber || taxInfo.panNumber) && (
          <div>
            <label className="text-sm font-medium text-gray-600">PAN Number</label>
            <p className="text-gray-900 mt-1">{company.panNumber || taxInfo.panNumber}</p>
          </div>
        )}

        {(company.panDocumentUrl || taxInfo.panDocumentUrl) && (
          <div>
            <label className="text-sm font-medium text-gray-600">PAN Document</label>
            <a
              href={company.panDocumentUrl || taxInfo.panDocumentUrl}
              target="_blank"
              rel="noreferrer"
              className="mt-1 inline-flex text-blue-700 hover:underline"
            >
              View document
            </a>
          </div>
        )}

        {taxInfo.financialYearStart && (
          <div>
            <label className="text-sm font-medium text-gray-600">Financial Year Start</label>
            <p className="text-gray-900 mt-1">{taxInfo.financialYearStart}</p>
          </div>
        )}
      </div>
    </div>
  );
}
