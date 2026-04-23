"use client";

import { useState } from "react";
import SelectField from "@/components/form/SelectField";
import InputField from "@/components/form/InputField";

interface Product {
  _id: string;
  productName: string;
  sku: string;
  category?: string;
}

interface CreatableProductSelectProps {
  products: Product[];
  value: string;
  onChange: (value: string) => void;
  error?: string;
  isLoading?: boolean;
}

export default function CreatableProductSelect({
  products,
  value,
  onChange,
  error,
  isLoading = false,
}: CreatableProductSelectProps) {
  const [useManualEntry, setUseManualEntry] = useState(false);

  // If no products available, allow manual entry
  if (products.length === 0) {
    return (
      <div className="space-y-2">
        <label className="block text-sm font-medium">
          Product<span className="text-red-500 ml-1">*</span>
        </label>
        <div className="flex gap-2">
          <InputField
            name="productName"
            type="text"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder="Enter product name"
            error={error}
            disabled={isLoading}
          />
          <button
            type="button"
            onClick={() => {
              setUseManualEntry(false);
              onChange("");
            }}
            className="px-3 py-2 text-sm font-medium text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 whitespace-nowrap"
          >
            ↻ Refresh
          </button>
        </div>
        <p className="text-xs text-gray-500">
          No products available. Enter product name manually.
        </p>
      </div>
    );
  }

  // If products available but user wants manual entry
  if (useManualEntry) {
    return (
      <div className="space-y-2">
        <label className="block text-sm font-medium">
          Product<span className="text-red-500 ml-1">*</span>
        </label>
        <div className="flex gap-2">
          <InputField
            name="productName"
            type="text"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder="Enter product name"
            error={error}
            disabled={isLoading}
          />
          <button
            type="button"
            onClick={() => {
              setUseManualEntry(false);
              onChange("");
            }}
            className="px-3 py-2 text-sm font-medium text-blue-600 border border-blue-300 bg-blue-50 rounded-lg hover:bg-blue-100 whitespace-nowrap"
          >
            Select from list
          </button>
        </div>
      </div>
    );
  }

  // Default: Show dropdown with option to enter manually
  return (
    <div className="space-y-2">
      <SelectField
        name="productId"
        label="Product"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        options={products.map((p) => ({
          value: p._id,
          label: `${p.productName} (${p.sku})`,
        }))}
        placeholder="Select product..."
        error={error}
        disabled={isLoading}
        required
      />
      <button
        type="button"
        onClick={() => {
          setUseManualEntry(true);
          onChange("");
        }}
        className="text-sm text-blue-600 hover:text-blue-700 font-medium"
      >
        + Enter product manually
      </button>
    </div>
  );
}
