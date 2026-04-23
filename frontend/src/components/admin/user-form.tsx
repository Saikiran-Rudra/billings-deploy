"use client";

import { useState, useEffect } from "react";
import { LoadingSpinner } from "@/components/ui/loaders/global-loader";
import { api } from "@/lib/api-client";
import { User, UserPermissions } from "@/types";

interface UserFormProps {
  mode: "create" | "edit";
  user?: User | null;
  onSuccess: () => void;
  onError: (message: string) => void;
}

const MODULE_ACTIONS = {
  product: ["view", "create", "update", "delete"],
  customer: ["view", "create", "update", "delete"],
  sales: ["view", "create", "update", "delete"],
  invoice: ["view", "create", "update", "delete"],
  payment: ["view", "create", "update", "delete"],
  report: ["view"],
  user: ["view", "create", "update", "delete"],
};

const DEFAULT_STAFF_PERMISSIONS: UserPermissions = {
  product: { view: true },
  customer: { view: true },
  sales: { view: true },
  invoice: { view: true },
  payment: { view: true },
  report: { view: true },
};

export default function UserForm({ mode, user, onSuccess, onError }: UserFormProps) {
  const [formData, setFormData] = useState({
    firstName: user?.firstName || "",
    lastName: user?.lastName || "",
    email: user?.email || "",
    role: (user?.role || "user") as "admin" | "user",
  });

  const [permissions, setPermissions] = useState<UserPermissions>(
    user?.permissions || DEFAULT_STAFF_PERMISSIONS
  );

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handlePermissionChange = (
    module: string,
    action: string,
    checked: boolean
  ) => {
    setPermissions((prev) => ({
      ...prev,
      [module]: {
        ...prev[module],
        [action]: checked,
      },
    }));
  };

  const handleRoleChange = (newRole: "admin" | "user") => {
    setFormData((prev) => ({ ...prev, role: newRole }));
    if (newRole === "admin") {
      // If admin, set all permissions to true
      const allPermissions: UserPermissions = {};
      Object.entries(MODULE_ACTIONS).forEach(([module, actions]) => {
        allPermissions[module] = {};
        actions.forEach((action) => {
          (allPermissions[module] as any)[action] = true;
        });
      });
      setPermissions(allPermissions);
    } else {
      // If user, reset to default
      setPermissions(DEFAULT_STAFF_PERMISSIONS);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!formData.firstName || !formData.lastName || !formData.email) {
      setError("Please fill in all required fields");
      return;
    }

    try {
      setIsLoading(true);

      if (mode === "create") {
        // Create new user
        await api.post("/users", {
          firstName: formData.firstName,
          lastName: formData.lastName,
          email: formData.email,
          role: formData.role,
          permissions,
        });
      } else {
        // Update existing user
        await api.put(`/users/${user?.id}`, {
          firstName: formData.firstName,
          lastName: formData.lastName,
          role: formData.role,
          permissions,
        });
      }

      onSuccess();
    } catch (err) {
      onError(err instanceof Error ? err.message : "Failed to save user");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="p-4 bg-red-50 text-red-700 rounded-lg border border-red-200">
          {error}
        </div>
      )}

      {/* Basic Information */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Basic Information</h3>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              First Name *
            </label>
            <input
              type="text"
              name="firstName"
              value={formData.firstName}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
              disabled={isLoading}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Last Name *
            </label>
            <input
              type="text"
              name="lastName"
              value={formData.lastName}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
              disabled={isLoading}
            />
          </div>
        </div>

        <div className="mt-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Email {mode === "create" && "*"}
          </label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleInputChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            required={mode === "create"}
            disabled={isLoading || mode === "edit"}
          />
        </div>

        {mode === "create" && (
          <div className="mt-4 rounded-lg border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-800">
            A temporary password will be generated automatically and emailed to the user.
          </div>
        )}
      </div>

      {/* Role Selection */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Role & Permissions</h3>
        <div className="flex gap-4 mb-6">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="radio"
              name="role"
              value="admin"
              checked={formData.role === "admin"}
              onChange={(e) => handleRoleChange(e.target.value as "admin" | "user")}
              disabled={isLoading}
              className="w-4 h-4"
            />
            <span className="text-sm font-medium text-gray-700">Admin (Full Access)</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="radio"
              name="role"
              value="user"
              checked={formData.role === "user"}
              onChange={(e) => handleRoleChange(e.target.value as "admin" | "user")}
              disabled={isLoading}
              className="w-4 h-4"
            />
            <span className="text-sm font-medium text-gray-700">Team Member (Custom Permissions)</span>
          </label>
        </div>

        {formData.role === "user" && (
          <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
            <h4 className="font-semibold text-gray-900 mb-4">Module Permissions</h4>
            <div className="space-y-4">
              {Object.entries(MODULE_ACTIONS).map(([module, actions]) => (
                <div key={module} className="border-b pb-4 last:border-b-0">
                  <h5 className="font-medium text-gray-800 mb-2 capitalize">{module}</h5>
                  <div className="grid grid-cols-2 gap-3">
                    {actions.map((action) => (
                      <label
                        key={`${module}-${action}`}
                        className="flex items-center gap-2 cursor-pointer"
                      >
                        <input
                          type="checkbox"
                          checked={
                            ((permissions as any)[module]?.[action] as any) ?? false
                          }
                          onChange={(e) =>
                            handlePermissionChange(module, action, e.target.checked)
                          }
                          disabled={isLoading}
                          className="w-4 h-4 text-blue-600"
                        />
                        <span className="text-sm text-gray-700 capitalize">{action}</span>
                      </label>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="flex justify-end gap-3 pt-6 border-t">
        <button
          type="button"
          onClick={() => window.history.back()}
          className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition"
          disabled={isLoading}
        >
          Cancel
        </button>
        <button
          type="submit"
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition flex items-center gap-2"
          disabled={isLoading}
        >
          {isLoading && <LoadingSpinner size="sm" />}
          {mode === "create" ? "Create User" : "Update User"}
        </button>
      </div>
    </form>
  );
}
