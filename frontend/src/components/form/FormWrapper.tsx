import { ReactNode, FormEvent } from "react";

interface FormWrapperProps {
  title: string;
  onSubmit: (e: FormEvent<HTMLFormElement>) => void;
  submitLabel: string;
  children: ReactNode;
  isLoading?: boolean;
  error?: string;
  success?: string;
}

export default function FormWrapper({
  title,
  onSubmit,
  submitLabel,
  children,
  isLoading,
  error,
  success,
}: FormWrapperProps) {
  return (
    <div className="p-6 w-full">
      <h2 className="text-2xl font-bold mb-6">{title}</h2>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm mb-4">{error}</div>
      )}
      {success && (
        <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg text-sm mb-4">{success}</div>
      )}

      <form onSubmit={onSubmit} className="bg-white p-6 rounded-xl shadow-md space-y-6 w-full">
        {children}
        <button
          type="submit"
          disabled={isLoading}
          className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg transition disabled:opacity-50"
        >
          {isLoading ? "Saving..." : submitLabel}
        </button>
      </form>
    </div>
  );
}
