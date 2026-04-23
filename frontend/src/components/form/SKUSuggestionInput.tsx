/**
 * SKU Suggestion Component
 * Shows suggested SKU and allows user to apply it or enter manually
 */

import { generateSKUSuggestion } from "@/utils/sku";

interface SKUSuggestionProps {
  prefix: string;
  sequence: number;
  currentSku: string;
  onApplySuggestion: (sku: string) => void;
  onManualChange: (sku: string) => void;
}

export default function SKUSuggestionInput({
  prefix,
  sequence,
  currentSku,
  onApplySuggestion,
  onManualChange,
}: SKUSuggestionProps) {
  const suggestion = generateSKUSuggestion(prefix, sequence);

  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-700">SKU</label>
      
      {/* Suggested SKU */}
      {suggestion.suggested && (
        <div className="bg-blue-50 border border-blue-200 rounded p-3 flex items-center justify-between">
          <div>
            <p className="text-xs text-gray-600">Suggested SKU</p>
            <p className="text-sm font-semibold text-blue-700">{suggestion.suggested}</p>
          </div>
          <button
            type="button"
            onClick={() => onApplySuggestion(suggestion.suggested)}
            className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700"
          >
            Use
          </button>
        </div>
      )}

      {/* Manual Input */}
      <div>
        <input
          type="text"
          placeholder="Enter SKU or use suggested above"
          value={currentSku}
          onChange={(e) => onManualChange(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
        />
        <p className="text-xs text-gray-500 mt-1">
          {currentSku && (
            <>
              ✓ SKU: <span className="font-mono font-semibold">{currentSku}</span>
            </>
          )}
        </p>
      </div>
    </div>
  );
}
