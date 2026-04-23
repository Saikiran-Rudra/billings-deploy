"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useAuth } from "@/hooks/use-auth";

export default function AdminPermissionsPage() {
  const router = useRouter();
  const { isAdmin } = useAuth();

  useEffect(() => {
    if (!isAdmin()) {
      router.replace("/dashboard");
    }
  }, [isAdmin, router]);

  const modules = [
    {
      name: "Products",
      description: "Manage product catalog, prices, and stock levels",
      actions: ["View", "Create", "Update", "Delete"],
    },
    {
      name: "Customers",
      description: "Manage customer information and accounts",
      actions: ["View", "Create", "Update", "Delete"],
    },
    {
      name: "Sales & Invoices",
      description: "Create and manage sales invoices",
      actions: ["View", "Create", "Update", "Delete"],
    },
    {
      name: "Payments",
      description: "Record and track customer payments",
      actions: ["View", "Create", "Update", "Delete"],
    },
    {
      name: "Reports",
      description: "View business reports and analytics",
      actions: ["View"],
    },
    {
      name: "User Management",
      description: "Create users and manage permissions",
      actions: ["View", "Create", "Update", "Delete"],
    },
  ];

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Permissions & Roles
        </h1>
        <p className="text-gray-600 mb-8">
          Overview of available modules and permissions
        </p>

        <div className="grid grid-cols-1 gap-6">
          {modules.map((module) => (
            <div
              key={module.name}
              className="bg-white rounded-lg shadow p-6"
            >
              <h2 className="text-xl font-semibold text-gray-900 mb-2">
                {module.name}
              </h2>
              <p className="text-gray-600 mb-4">{module.description}</p>
              <div className="flex flex-wrap gap-2">
                {module.actions.map((action) => (
                  <span
                    key={action}
                    className="px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full"
                  >
                    {action}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-8 bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Role Types
          </h2>
          <div className="space-y-4">
            <div>
              <h3 className="font-semibold text-gray-900">Admin</h3>
              <p className="text-gray-600">
                Has full access to all modules and permissions. Can create and
                manage users.
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">Staff</h3>
              <p className="text-gray-600">
                Has limited access based on assigned permissions. Admin can
                customize permissions per staff member.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
