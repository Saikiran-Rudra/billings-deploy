"use client";

import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import { cashBankFormConfig } from "@/data/cash-bank-form";
import { cashBankValidationSchema, type CashBankFormData } from "@/lib/validations/cash-bank";
import FormWrapper from "@/components/form/FormWrapper";
import InputField from "@/components/form/InputField";
import SelectField from "@/components/form/SelectField";
import TextAreaField from "@/components/form/TextAreaField";

export default function NewCashRecordPage() {
  const router = useRouter();
  const [formData, setFormData] = useState<Partial<CashBankFormData>>({});
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
      cashBankValidationSchema.parse(formData);
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
    console.log("Cash & Bank Record:", formData);
    router.push("/accounting/cashbank");
  };

  return (
    <FormWrapper
      title="Add Cash & Bank Record"
      onSubmit={handleSubmit}
      submitLabel="Save Record"
    >
      <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
        {cashBankFormConfig.map((field) => (
          <div key={field.name} className={field.gridSpan || "md:col-span-12"}>
            {field.type === "textarea" ? (
              <TextAreaField
                label={field.label}
                name={field.name}
                placeholder={field.placeholder}
                value={(formData[field.name as keyof CashBankFormData] as string) || ""}
                onChange={(e) => handleChange(field.name, e.target.value)}
              />
            ) : field.type === "select" ? (
              <SelectField
                label={field.label}
                name={field.name}
                options={field.options || []}
                value={(formData[field.name as keyof CashBankFormData] as string) || ""}
                onChange={(e) => handleChange(field.name, e.target.value)}
                placeholder={field.placeholder}
              />
            ) : (
              <InputField
                label={field.label}
                name={field.name}
                type={field.type}
                placeholder={field.placeholder}
                value={(formData[field.name as keyof CashBankFormData] as string | number) || ""}
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
