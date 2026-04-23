"use client";

import { useState, FormEvent } from "react";
import { receivableFormConfig } from "@/data/receivable-form";
import { receivableValidationSchema, type ReceivableFormData } from "@/lib/validations/receivable";
import FormWrapper from "@/components/form/FormWrapper";
import InputField from "@/components/form/InputField";
import SelectField from "@/components/form/SelectField";

export default function NewReceivable() {
  const [formData, setFormData] = useState<Partial<ReceivableFormData>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});

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
      receivableValidationSchema.parse(formData);
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
    console.log("Receivable Data:", formData);
  };

  return (
    <FormWrapper
      title="New Receivable"
      onSubmit={handleSubmit}
      submitLabel="Save Receivable"
    >
      <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
        {receivableFormConfig.map((field) => (
          <div key={field.name} className={field.gridSpan || "md:col-span-12"}>
            {field.type === "select" ? (
              <SelectField
                label={field.label}
                name={field.name}
                options={field.options || []}
                value={(formData[field.name as keyof ReceivableFormData] as string) || ""}
                onChange={(e) => handleChange(field.name, e.target.value)}
                placeholder={field.placeholder}
              />
            ) : (
              <InputField
                label={field.label}
                name={field.name}
                type={field.type}
                placeholder={field.placeholder}
                value={(formData[field.name as keyof ReceivableFormData] as string | number) || ""}
                onChange={(e) => handleChange(field.name, e.target.value)}
                required={field.required}
                error={errors[field.name]}
              />
            )}
          </div>
        ))}
      </div>
    </FormWrapper>
  );
}
