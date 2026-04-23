"use client";

import { ChangeEvent, useId, useRef } from "react";
import { FileText, Loader2, RefreshCcw, Upload, X } from "lucide-react";

interface DocumentUploadFieldProps {
  label: string;
  value?: string;
  error?: string;
  required?: boolean;
  disabled?: boolean;
  isUploading?: boolean;
  onChange: (file?: File) => void;
  onRemove?: () => void;
}

export default function DocumentUploadField({
  label,
  value,
  error,
  required,
  disabled = false,
  isUploading = false,
  onChange,
  onRemove,
}: DocumentUploadFieldProps) {
  const inputId = useId();
  const inputRef = useRef<HTMLInputElement | null>(null);

  const handleInputChange = (event: ChangeEvent<HTMLInputElement>) => {
    onChange(event.target.files?.[0]);
    event.target.value = "";
  };

  return (
    <div>
      <label className="mb-1 block text-sm font-medium">
        {label}
        {required && <span className="ml-1 text-red-500">*</span>}
      </label>

      <input
        ref={inputRef}
        id={inputId}
        type="file"
        accept="application/pdf,image/png,image/jpeg"
        onChange={handleInputChange}
        disabled={disabled || isUploading}
        className="hidden"
      />

      <div
        className={`rounded-lg border px-3 py-3 ${
          error ? "border-red-400" : "border-gray-300"
        } ${disabled ? "bg-gray-100" : "bg-white"}`}
      >
        {value ? (
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <a
              href={value}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 text-sm font-medium text-blue-700 hover:underline"
            >
              <FileText className="h-4 w-4" />
              View document
            </a>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => inputRef.current?.click()}
                disabled={disabled || isUploading}
                className="inline-flex items-center gap-2 rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isUploading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <RefreshCcw className="h-4 w-4" />
                )}
                Replace
              </button>

              {onRemove ? (
                <button
                  type="button"
                  onClick={onRemove}
                  disabled={disabled || isUploading}
                  className="inline-flex items-center gap-2 rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  <X className="h-4 w-4" />
                  Remove
                </button>
              ) : null}
            </div>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            disabled={disabled || isUploading}
            className="inline-flex items-center gap-2 rounded-lg border border-dashed border-gray-300 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isUploading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Upload className="h-4 w-4" />
            )}
            {isUploading ? "Uploading..." : "Upload document"}
          </button>
        )}

        <p className="mt-2 text-xs text-gray-500">PDF, PNG, JPG up to 5MB</p>
      </div>

      {error ? <p className="mt-1 text-xs text-red-500">{error}</p> : null}
    </div>
  );
}
