"use client";

import type { FormEvent } from "react";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import FormWrapper from "@/components/form/FormWrapper";
import UserForm from "@/components/superadmin/user-form";
import { useUsers } from "@/hooks/use-users";
import type { UserFormValues } from "@/modules/users/types";
import { getUserInitialValues } from "@/modules/users/userForm.config";

export default function NewUserPage() {
  const router = useRouter();
  const { companies, loading, error, fetchCompanies, createUser } = useUsers();
  const [values, setValues] = useState<UserFormValues>(getUserInitialValues());
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [success, setSuccess] = useState("");

  useEffect(() => {
    fetchCompanies();
  }, [fetchCompanies]);

  const handleChange = (field: keyof UserFormValues, value: string | boolean) => {
    setValues((current) => ({ ...current, [field]: value }));
    setFieldErrors((current) => {
      const next = { ...current };
      delete next[field];
      return next;
    });
  };

  const validate = () => {
    const nextErrors: Record<string, string> = {};
    if (!values.firstName) nextErrors.firstName = "First name is required";
    if (!values.lastName) nextErrors.lastName = "Last name is required";
    if (!values.email) nextErrors.email = "Email is required";
    if (!values.companyId) nextErrors.companyId = "Company is required";
    setFieldErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSuccess("");

    if (!validate()) return;

    await createUser(values);
    setSuccess("User created successfully");
    router.push("/superadmin/users");
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <button
        onClick={() => router.back()}
        className="ml-6 mt-6 inline-flex items-center gap-2 text-blue-600 hover:text-blue-700"
      >
        <ArrowLeft size={18} />
        Back
      </button>
      <FormWrapper
        title="Create User"
        submitLabel="Create User"
        onSubmit={handleSubmit}
        error={error || undefined}
        success={success}
        isLoading={loading}
      >
        <UserForm
          mode="create"
          values={values}
          companies={companies}
          errors={fieldErrors}
          disabled={loading}
          onChange={handleChange}
        />
      </FormWrapper>
    </div>
  );
}
