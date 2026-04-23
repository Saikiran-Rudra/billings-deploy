"use client";

import type { FormEvent } from "react";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import FormWrapper from "@/components/form/FormWrapper";
import UserForm from "@/components/superadmin/user-form";
import { LoadingSpinner } from "@/components/ui/loaders/global-loader";
import { useUsers } from "@/hooks/use-users";
import type { UserFormValues } from "@/modules/users/types";

const emptyValues: UserFormValues = {
  firstName: "",
  lastName: "",
  email: "",
  password: "",
  role: "user",
  companyId: "",
  isActive: true,
};

export default function EditUserPage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const {
    companies,
    selectedUser,
    loading,
    error,
    fetchCompanies,
    fetchUser,
    updateUser,
  } = useUsers();
  const [values, setValues] = useState<UserFormValues>(emptyValues);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [success, setSuccess] = useState("");

  useEffect(() => {
    fetchCompanies();
    fetchUser(params.id);
  }, [fetchCompanies, fetchUser, params.id]);

  useEffect(() => {
    if (!selectedUser) return;
    setValues({
      firstName: selectedUser.firstName,
      lastName: selectedUser.lastName,
      email: selectedUser.email,
      password: "",
      role: selectedUser.role,
      companyId: selectedUser.companyId || "",
      isActive: selectedUser.isActive,
    });
  }, [selectedUser]);

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
    if (!values.companyId) nextErrors.companyId = "Company is required";
    setFieldErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSuccess("");

    if (!validate()) return;

    const { password: _password, email: _email, ...payload } = values;
    await updateUser(params.id, payload);
    setSuccess("User updated successfully");
    router.push(`/superadmin/users/${params.id}`);
  };

  if (loading && !selectedUser) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

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
        title="Edit User"
        submitLabel="Update User"
        onSubmit={handleSubmit}
        error={error || undefined}
        success={success}
        isLoading={loading}
      >
        <UserForm
          mode="edit"
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
