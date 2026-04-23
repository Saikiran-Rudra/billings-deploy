interface CheckboxFieldProps {
  label: string;
  name: string;
  checked?: boolean;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export default function CheckboxField({
  label,
  name,
  checked,
  onChange,
}: CheckboxFieldProps) {
  return (
    <label className="flex items-center gap-2">
      <input
        type="checkbox"
        name={name}
        checked={checked}
        onChange={onChange}
        className="accent-green-500"
      />
      <span className="text-sm">{label}</span>
    </label>
  );
}
