"use client";

import { useState, FormEvent } from "react";
import { expenseFormConfig } from "@/data/expense-form";
import { expenseValidationSchema, type ExpenseFormData } from "@/lib/validations/expense";
import FormWrapper from "@/components/form/FormWrapper";
import InputField from "@/components/form/InputField";
import SelectField from "@/components/form/SelectField";
import TextAreaField from "@/components/form/TextAreaField";

export default function ExpensesPage() {
  const [formData, setFormData] = useState<Partial<ExpenseFormData>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showForm, setShowForm] = useState(false);

  const handleChange = (fieldName: string, value: string | number) => {
    setFormData((prev) => ({
      ...prev,
      [fieldName]: value,
    }));
    if (errors[fieldName]) {
      setErrors((prev) => ({
        ...prev,
        [fieldName]: "",
      }));
    }
  };

  const validateForm = () => {
    try {
      expenseValidationSchema.parse(formData);
      setErrors({});
      return true;
    } catch (error: any) {
      const newErrors: Record<string, string> = {};
      if (error.errors) {
        error.errors.forEach((err: any) => {
          newErrors[err.path[0]] = err.message;
        });
      }
      setErrors(newErrors);
      return false;
    }
  };

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!validateForm()) {
      return;
    }
    console.log("Expense Data:", formData);
    setFormData({});
    setShowForm(false);
  };

  return (
    <div className="p-6">
      {!showForm ? (
        <div>
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold">Expenses</h2>
            <button
              onClick={() => setShowForm(true)}
              className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition"
            >
              + Add Expense
            </button>
          </div>
          <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg">
            <p className="text-blue-700">No expenses recorded yet. Click "Add Expense" to create one.</p>
          </div>
        </div>
      ) : (
        <div>
          <FormWrapper
            title="Add New Expense"
            onSubmit={handleSubmit}
            submitLabel="Save Expense"
          >
            <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
              {expenseFormConfig.map((field) => (
                <div key={field.name} className={field.gridSpan || "md:col-span-12"}>
                  {field.type === "textarea" ? (
                    <TextAreaField
                      label={field.label}
                      name={field.name}
                      placeholder={field.placeholder}
                      value={(formData[field.name as keyof ExpenseFormData] as string) || ""}
                      onChange={(e) => handleChange(field.name, e.target.value)}
                    />
                  ) : field.type === "select" ? (
                    <SelectField
                      label={field.label}
                      name={field.name}
                      options={field.options || []}
                      value={(formData[field.name as keyof ExpenseFormData] as string) || ""}
                      onChange={(e) => handleChange(field.name, e.target.value)}
                      placeholder={field.placeholder}
                    />
                  ) : (
                    <InputField
                      label={field.label}
                      name={field.name}
                      type={field.type}
                      placeholder={field.placeholder}
                      value={(formData[field.name as keyof ExpenseFormData] as string | number) || ""}
                      onChange={(e) => handleChange(field.name, e.target.value)}
                      required={field.required}
                      error={errors[field.name]}
                    />
                  )}
                </div>
              ))}
            </div>
          </FormWrapper>
        </div>
      )}
    </div>
  );
}
