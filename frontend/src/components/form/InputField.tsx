interface InputFieldProps {
  label: string;
  name: string;
  type?: string;
  placeholder?: string;
  value?: string | number;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  readOnly?: boolean;
  required?: boolean;
  error?: string;
  disabled?: boolean;
  step?: string | number;
  min?: string | number;
  max?: string | number;
}

export default function InputField({
  label,
  name,
  type = "text",
  placeholder,
  value,
  onChange,
  readOnly,
  required,
  error,
  disabled = false,
  step,
  min,
  max,
}: InputFieldProps) {
  return (
    <div>
      <label className="block text-sm font-medium mb-1">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>
      <input
        type={type}
        name={name}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        readOnly={readOnly}
        required={required}
        disabled={disabled}
        step={step}
        min={min}
        max={max}
        className={`w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 ${
          disabled ? 'bg-gray-100 text-gray-500 cursor-not-allowed' : ''
        } ${
          error ? "border-red-400 focus:ring-red-200" : "border-gray-300 focus:ring-green-500"
        }`}
      />
      {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
    </div>
  );
}
