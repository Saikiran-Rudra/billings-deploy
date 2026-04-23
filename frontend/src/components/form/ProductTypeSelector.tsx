interface ProductTypeSelectorProps {
  value: "goods" | "service";
  onChange: (value: "goods" | "service") => void;
}

export default function ProductTypeSelector({ value, onChange }: ProductTypeSelectorProps) {
  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-700">Product Type</label>
      <div className="flex gap-4">
        <label className="flex items-center">
          <input
            type="radio"
            name="productType"
            value="goods"
            checked={value === "goods"}
            onChange={(e) => onChange(e.target.value as "goods" | "service")}
            className="mr-2 w-4 h-4"
          />
          <span className="text-sm">Goods (has stock)</span>
        </label>
        <label className="flex items-center">
          <input
            type="radio"
            name="productType"
            value="service"
            checked={value === "service"}
            onChange={(e) => onChange(e.target.value as "goods" | "service")}
            className="mr-2 w-4 h-4"
          />
          <span className="text-sm">Service (no stock)</span>
        </label>
      </div>
      <p className="text-xs text-gray-500 mt-1">
        {value === "goods" ? "Stock fields will be enabled" : "Stock fields will be hidden"}
      </p>
    </div>
  );
}
