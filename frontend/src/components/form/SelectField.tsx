interface SelectOption {
  value: string | number;
  label: string;
}

interface SelectFieldProps {
  label: string;
  name: string;
  options: SelectOption[];
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  placeholder?: string;
  error?: string;
  disabled?: boolean;
  required?: boolean;
}

export default function SelectField({
  label,
  name,
  options,
  value,
  onChange,
  placeholder,
  error,
  disabled = false,
  required,
}: SelectFieldProps) {
  return (
    <div>
      <label className="block text-sm font-medium mb-1">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>
      <select
        name={name}
        value={value}
        onChange={onChange}
        disabled={disabled}
        required={required}
        className={`w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 ${
          disabled ? 'bg-gray-100 text-gray-500 cursor-not-allowed' : ''
        } ${
          error ? "border-red-400 focus:ring-red-200" : "border-gray-300 focus:ring-green-500"
        }`}
      >
        {placeholder && <option value="">{placeholder}</option>}
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
      {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
    </div>
  );
}
