/**
 * Product Configuration Settings Component
 * Manages product-related configuration like categories, units, GST rates, and SKU settings
 */

"use client";

import { useState } from "react";
import { useProductConfig } from "@/hooks/useProductConfig";
import InputField from "@/components/form/InputField";

export default function ProductConfigSettings() {
  const {
    config,
    isLoading,
    error,
    addCategory,
    removeCategory,
    addUnit,
    removeUnit,
    updateGstRates,
    updateSkuSettings,
  } = useProductConfig();

  const [newCategory, setNewCategory] = useState("");
  const [newUnit, setNewUnit] = useState("");
  const [gstRatesInput, setGstRatesInput] = useState("");
  const [skuPrefix, setSkuPrefix] = useState("");
  const [skuSequence, setSkuSequence] = useState("");
  const [addingCategory, setAddingCategory] = useState(false);
  const [addingUnit, setAddingUnit] = useState(false);
  const [updatingGst, setUpdatingGst] = useState(false);
  const [updatingSku, setUpdatingSku] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);

  const handleAddCategory = async () => {
    if (!newCategory.trim()) {
      setLocalError("Category name cannot be empty");
      return;
    }
    try {
      setAddingCategory(true);
      setLocalError(null);
      await addCategory(newCategory);
      setNewCategory("");
    } catch (err) {
      setLocalError(err instanceof Error ? err.message : "Failed to add category");
    } finally {
      setAddingCategory(false);
    }
  };

  const handleRemoveCategory = async (category: string) => {
    try {
      setLocalError(null);
      await removeCategory(category);
    } catch (err) {
      setLocalError(err instanceof Error ? err.message : "Failed to remove category");
    }
  };

  const handleAddUnit = async () => {
    if (!newUnit.trim()) {
      setLocalError("Unit name cannot be empty");
      return;
    }
    try {
      setAddingUnit(true);
      setLocalError(null);
      await addUnit(newUnit);
      setNewUnit("");
    } catch (err) {
      setLocalError(err instanceof Error ? err.message : "Failed to add unit");
    } finally {
      setAddingUnit(false);
    }
  };

  const handleRemoveUnit = async (unit: string) => {
    try {
      setLocalError(null);
      await removeUnit(unit);
    } catch (err) {
      setLocalError(err instanceof Error ? err.message : "Failed to remove unit");
    }
  };

  const handleUpdateGstRates = async () => {
    if (!gstRatesInput.trim()) {
      setLocalError("GST rates cannot be empty");
      return;
    }
    try {
      setUpdatingGst(true);
      setLocalError(null);
      const rates = gstRatesInput.split(",").map((r) => parseFloat(r.trim()));
      if (rates.some(isNaN)) {
        setLocalError("All GST rates must be valid numbers");
        setUpdatingGst(false);
        return;
      }
      await updateGstRates(rates);
      setGstRatesInput("");
    } catch (err) {
      setLocalError(err instanceof Error ? err.message : "Failed to update GST rates");
    } finally {
      setUpdatingGst(false);
    }
  };

  const handleUpdateSkuSettings = async () => {
    if (!skuPrefix.trim() || !skuSequence.trim()) {
      setLocalError("SKU prefix and sequence are required");
      return;
    }
    try {
      setUpdatingSku(true);
      setLocalError(null);
      const sequence = parseInt(skuSequence);
      if (isNaN(sequence)) {
        setLocalError("SKU sequence must be a valid number");
        setUpdatingSku(false);
        return;
      }
      await updateSkuSettings(skuPrefix, sequence);
      setSkuPrefix("");
      setSkuSequence("");
    } catch (err) {
      setLocalError(err instanceof Error ? err.message : "Failed to update SKU settings");
    } finally {
      setUpdatingSku(false);
    }
  };

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-xl font-semibold mb-4">Product Configuration</h3>
        <p className="text-gray-500">Loading configuration...</p>
      </div>
    );
  }

  if (error && !config) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-xl font-semibold mb-4">Product Configuration</h3>
        <div className="bg-red-50 border border-red-200 rounded p-4 text-red-700">
          Error loading configuration: {error}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Error Message */}
      {localError && (
        <div className="bg-red-50 border border-red-200 rounded p-4 text-red-700">
          {localError}
        </div>
      )}

      {/* Categories Section */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold mb-4">Product Categories</h3>
        <div className="space-y-3">
          {config?.categories && config.categories.length > 0 ? (
            <div className="flex flex-wrap gap-2 mb-4">
              {config.categories.map((category) => (
                <div
                  key={category}
                  className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm flex items-center gap-2"
                >
                  {category}
                  <button
                    onClick={() => handleRemoveCategory(category)}
                    className="text-blue-600 hover:text-blue-800 font-bold"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-sm">No categories added yet</p>
          )}
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="Enter category name"
              value={newCategory}
              onChange={(e) => setNewCategory(e.target.value)}
              className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-sm"
            />
            <button
              onClick={handleAddCategory}
              disabled={addingCategory}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 text-sm"
            >
              {addingCategory ? "Adding..." : "Add"}
            </button>
          </div>
        </div>
      </div>

      {/* Units Section */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold mb-4">Units of Measurement</h3>
        <div className="space-y-3">
          {config?.units && config.units.length > 0 ? (
            <div className="flex flex-wrap gap-2 mb-4">
              {config.units.map((unit) => (
                <div
                  key={unit}
                  className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm flex items-center gap-2"
                >
                  {unit}
                  <button
                    onClick={() => handleRemoveUnit(unit)}
                    className="text-green-600 hover:text-green-800 font-bold"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-sm">No units added yet</p>
          )}
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="Enter unit name (e.g., kg, liter, piece)"
              value={newUnit}
              onChange={(e) => setNewUnit(e.target.value)}
              className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-sm"
            />
            <button
              onClick={handleAddUnit}
              disabled={addingUnit}
              className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:bg-gray-400 text-sm"
            >
              {addingUnit ? "Adding..." : "Add"}
            </button>
          </div>
        </div>
      </div>

      {/* GST Rates Section */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold mb-4">GST Rates (%)</h3>
        <div className="space-y-3">
          {config?.gstRates && config.gstRates.length > 0 ? (
            <div className="flex flex-wrap gap-2 mb-4">
              {config.gstRates.map((rate) => (
                <div
                  key={rate}
                  className="bg-purple-100 text-purple-800 px-3 py-1 rounded-full text-sm"
                >
                  {rate}%
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-sm">No GST rates configured</p>
          )}
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="Enter rates separated by comma (e.g., 5, 12, 18, 28)"
              value={gstRatesInput}
              onChange={(e) => setGstRatesInput(e.target.value)}
              className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-sm"
            />
            <button
              onClick={handleUpdateGstRates}
              disabled={updatingGst}
              className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 disabled:bg-gray-400 text-sm"
            >
              {updatingGst ? "Updating..." : "Update"}
            </button>
          </div>
        </div>
      </div>

      {/* SKU Settings Section */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold mb-4">SKU Settings</h3>
        <div className="space-y-3">
          {config?.sku && (
            <div className="bg-gray-50 p-3 rounded-md mb-4">
              <p className="text-sm text-gray-700">
                <span className="font-semibold">Prefix:</span> {config.sku.prefix}
              </p>
              <p className="text-sm text-gray-700">
                <span className="font-semibold">Next Sequence:</span> {config.sku.sequence}
              </p>
            </div>
          )}
          <div className="grid grid-cols-2 gap-2">
            <input
              type="text"
              placeholder="SKU Prefix (e.g., PROD)"
              value={skuPrefix}
              onChange={(e) => setSkuPrefix(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md text-sm"
            />
            <input
              type="number"
              placeholder="Next Sequence"
              value={skuSequence}
              onChange={(e) => setSkuSequence(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md text-sm"
            />
          </div>
          <button
            onClick={handleUpdateSkuSettings}
            disabled={updatingSku}
            className="w-full px-4 py-2 bg-orange-600 text-white rounded-md hover:bg-orange-700 disabled:bg-gray-400 text-sm"
          >
            {updatingSku ? "Updating..." : "Update SKU Settings"}
          </button>
        </div>
      </div>
    </div>
  );
}
