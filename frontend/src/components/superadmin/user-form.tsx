"use client";

import InputField from "@/components/form/InputField";
import SelectField from "@/components/form/SelectField";
import type { Company } from "@/types";
import type { UserFormValues } from "@/modules/users/types";
import { userRoleOptions, userStatusOptions } from "@/modules/users/userForm.config";

interface UserFormProps {
  values: UserFormValues;
  companies: Company[];
  mode: "create" | "edit";
  errors?: Record<string, string>;
  disabled?: boolean;
  onChange: (field: keyof UserFormValues, value: string | boolean) => void;
}

type CompanyWithId = Company & { _id?: string };

const getCompanyId = (company: CompanyWithId) => company.id || company._id || "";

export default function UserForm({
  values,
  companies,
  mode,
  errors = {},
  disabled = false,
  onChange,
}: UserFormProps) {
  const companyOptions = companies
    .map((company) => ({
      value: getCompanyId(company),
      label: company.name,
    }))
    .filter((company) => company.value);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <InputField
          label="First Name"
          name="firstName"
          value={values.firstName}
          onChange={(event) => onChange("firstName", event.target.value)}
          error={errors.firstName}
          disabled={disabled}
          required
        />
        <InputField
          label="Last Name"
          name="lastName"
          value={values.lastName}
          onChange={(event) => onChange("lastName", event.target.value)}
          error={errors.lastName}
          disabled={disabled}
          required
        />
      </div>

      <div className="grid grid-cols-1 gap-4">
        <InputField
          label="Email"
          name="email"
          type="email"
          value={values.email}
          onChange={(event) => onChange("email", event.target.value)}
          error={errors.email}
          disabled={disabled || mode === "edit"}
          required
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <SelectField
          label="Role"
          name="role"
          value={values.role}
          options={userRoleOptions}
          onChange={(event) => onChange("role", event.target.value)}
          error={errors.role}
          disabled={disabled}
          required
        />
        <SelectField
          label="Company"
          name="companyId"
          value={values.companyId}
          options={companyOptions}
          placeholder="Select company"
          onChange={(event) => onChange("companyId", event.target.value)}
          error={errors.companyId}
          disabled={disabled}
          required
        />
        <SelectField
          label="Status"
          name="status"
          value={values.isActive === false ? "disabled" : "active"}
          options={userStatusOptions}
          onChange={(event) => onChange("isActive", event.target.value === "active")}
          error={errors.isActive}
          disabled={disabled}
          required
        />
      </div>
    </div>
  );
}
