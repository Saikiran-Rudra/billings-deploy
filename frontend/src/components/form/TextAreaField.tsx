interface TextAreaFieldProps {
  label: string;
  name: string;
  placeholder?: string;
  rows?: number;
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  error?: string;
  disabled?: boolean;
}

export default function TextAreaField({
  label,
  name,
  placeholder,
  rows = 3,
  value,
  onChange,
  error,
  disabled = false,
}: TextAreaFieldProps) {
  return (
    <div>
      <label className="block text-sm font-medium mb-1">{label}</label>
      <textarea
        name={name}
        placeholder={placeholder}
        rows={rows}
        value={value}
        onChange={onChange}
        disabled={disabled}
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
