"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Plus, Eye, Edit2, Trash2, Ban, AlertCircle, Settings } from "lucide-react";
import { api } from "@/lib/api-client";
import { useAuth } from "@/hooks/use-auth";
import { TableSkeleton } from "@/components/ui/loaders/global-loader";
import { User } from "@/types";

interface UserResponse {
  message: string;
  data: User[];
}

export default function AdminUsersPage() {
  const router = useRouter();
  const { isAdmin, hasPermission, user: currentUser } = useAuth();
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [disablingId, setDisablingId] = useState<string | null>(null);

  // Pagination
  const [page, setPage] = useState(1);
  const limit = 20;

  // Permission checks
  const canCreate = hasPermission("user", "create");
  const canView = hasPermission("user", "view");
  const canUpdate = hasPermission("user", "update");
  const canDelete = hasPermission("user", "delete");

  // Redirect if not admin
  useEffect(() => {
    if (!isAdmin()) {
      router.replace("/dashboard");
    }
  }, [isAdmin, router]);

  // Fetch users with pagination
  useEffect(() => {
    if (!isAdmin()) return;

    const fetchUsers = async () => {
      try {
        setIsLoading(true);
        const response = await api.get<UserResponse>("/users");
        setAllUsers(response.data);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to fetch users");
      } finally {
        setIsLoading(false);
      }
    };

    fetchUsers();
  }, [isAdmin]);

  const handleView = (userId: string) => {
    router.push(`/admin/users/${userId}`);
  };

  const handleEdit = (userId: string) => {
    router.push(`/admin/users/${userId}/edit`);
  };

  const handleRemove = async (userId: string) => {
    if (userId === currentUser?.id) {
      setError("You cannot remove your own account");
      return;
    }

    if (!confirm("Remove this user from the company?")) return;

    try {
      setDeletingId(userId);
      await api.put(`/users/${userId}`, { status: "inactive" });
      setAllUsers(allUsers.map((u) => (u.id === userId ? { ...u, status: "inactive" } : u)));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to remove user");
    } finally {
      setDeletingId(null);
    }
  };

  const handleDisable = async (userId: string) => {
    if (userId === currentUser?.id) {
      setError("You cannot disable your own account");
      return;
    }

    if (!confirm("Are you sure you want to disable this user?")) return;

    try {
      setDisablingId(userId);
      await api.put(`/users/${userId}`, { isActive: false });
      setAllUsers(allUsers.map((u) => (u.id === userId ? { ...u, isActive: false } : u)));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to disable user");
    } finally {
      setDisablingId(null);
    }
  };

  const handleDelete = async (userId: string) => {
    if (userId === currentUser?.id) {
      setError("You cannot delete your own account");
      return;
    }

    if (!confirm("Are you sure you want to permanently delete this user? This action cannot be undone.")) return;

    try {
      setDeletingId(userId);
      await api.delete(`/users/${userId}`);
      setAllUsers(allUsers.filter((u) => u.id !== userId));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete user");
    } finally {
      setDeletingId(null);
    }
  };

  // Client-side pagination
  const total = allUsers.length;
  const totalPages = Math.ceil(total / limit);
  const startIndex = (page - 1) * limit;
  const endIndex = Math.min(page * limit, total);
  const users = allUsers.slice(startIndex, endIndex);
  const pageStartIndex = startIndex + 1;

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">User Management</h1>
            <p className="text-gray-600 mt-1">Manage team members and their permissions</p>
          </div>
          {canCreate && (
            <button
              onClick={() => router.push("/admin/users/new")}
              className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
            >
              <Plus size={20} />
              Create User
            </button>
          )}
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
            <p className="text-red-700">{error}</p>
          </div>
        )}

        {/* Loading State */}
        {isLoading ? (
          <TableSkeleton rows={5} columns={7} />
        ) : users.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
            <p className="text-gray-500">No users found</p>
            {canCreate && (
              <button
                onClick={() => router.push("/admin/users/new")}
                className="mt-4 text-blue-600 hover:text-blue-700 font-medium"
              >
                Create the first user
              </button>
            )}
          </div>
        ) : (
          <>
            {/* Table */}
            <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Name</th>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Email</th>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Role</th>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Status</th>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Module Status</th>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Active</th>
                      <th className="px-6 py-3 text-right text-sm font-semibold text-gray-900">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {users.map((user) => {
                      const modulesAssigned = user.isModuleAssigned !== false;

                      return (
                      <tr
                        key={user.id}
                        className={`transition ${
                          modulesAssigned ? "hover:bg-gray-50" : "bg-amber-50/60 hover:bg-amber-50"
                        }`}
                      >
                        <td className="px-6 py-4">
                          <p className="font-medium text-gray-900">{`${user.firstName} ${user.lastName}`}</p>
                        </td>
                        <td className="px-6 py-4 text-gray-600">{user.email}</td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                            user.role === "admin" ? "bg-purple-100 text-purple-800" : "bg-blue-100 text-blue-800"
                          }`}>
                            {user.role?.charAt(0).toUpperCase() + (user.role?.slice(1) || "user")}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                            (user.status || "active") === "active" ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"
                          }`}>
                            {(user.status || "active").charAt(0).toUpperCase() + (user.status || "active").slice(1)}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                            modulesAssigned
                              ? "bg-green-100 text-green-800"
                              : "bg-amber-100 text-amber-800"
                          }`}>
                            {modulesAssigned ? "Active" : "Pending Setup"}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                            user.isActive ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                          }`}>
                            {user.isActive ? "Active" : "Disabled"}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex justify-end gap-2">
                            {canView && (
                              <button
                                onClick={() => handleView(user.id)}
                                className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded transition"
                                title="View user"
                              >
                                <Eye className="w-4 h-4" />
                              </button>
                            )}
                            {canUpdate && !modulesAssigned && user.id !== currentUser?.id && (
                              <button
                                onClick={() => handleEdit(user.id)}
                                className="inline-flex items-center gap-1 rounded bg-blue-600 px-3 py-2 text-xs font-semibold text-white transition hover:bg-blue-700"
                                title="Assign modules"
                              >
                                <Settings className="w-4 h-4" />
                                Assign Modules
                              </button>
                            )}
                            {canUpdate && user.id !== currentUser?.id && (
                              <button
                                onClick={() => handleEdit(user.id)}
                                className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded transition"
                                title="Edit user"
                              >
                                <Edit2 className="w-4 h-4" />
                              </button>
                            )}
                            {canUpdate && user.isActive && user.id !== currentUser?.id && (
                              <button
                                onClick={() => handleDisable(user.id)}
                                disabled={disablingId === user.id}
                                className="p-2 text-yellow-600 hover:text-yellow-900 hover:bg-yellow-50 rounded transition disabled:opacity-50"
                                title="Disable user"
                              >
                                {disablingId === user.id ? (
                                  <div className="w-4 h-4 border-2 border-yellow-300 border-t-yellow-600 rounded-full animate-spin" />
                                ) : (
                                  <Ban className="w-4 h-4" />
                                )}
                              </button>
                            )}
                            {canDelete && user.id !== currentUser?.id && (
                              <button
                                onClick={() => handleDelete(user.id)}
                                disabled={deletingId === user.id}
                                className="p-2 text-red-600 hover:text-red-900 hover:bg-red-50 rounded transition disabled:opacity-50"
                                title="Delete user"
                              >
                                {deletingId === user.id ? (
                                  <div className="w-4 h-4 border-2 border-red-300 border-t-red-600 rounded-full animate-spin" />
                                ) : (
                                  <Trash2 className="w-4 h-4" />
                                )}
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    )})}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="mt-6 flex items-center justify-between">
                <div className="text-sm text-gray-600">
                  Showing {pageStartIndex} to {endIndex} of {total} users
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => setPage(Math.max(1, page - 1))}
                    disabled={page === 1}
                    className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition"
                  >
                    Previous
                  </button>
                  <div className="flex items-center gap-2">
                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                      const pageNum = page > 3 ? page - 2 + i : i + 1;
                      return pageNum <= totalPages ? (
                        <button
                          key={pageNum}
                          onClick={() => setPage(pageNum)}
                          className={`px-3 py-2 rounded-lg transition ${
                            page === pageNum
                              ? "bg-blue-600 text-white"
                              : "border border-gray-300 text-gray-700 hover:bg-gray-50"
                          }`}
                        >
                          {pageNum}
                        </button>
                      ) : null;
                    })}
                  </div>
                  <button
                    onClick={() => setPage(Math.min(totalPages, page + 1))}
                    disabled={page === totalPages}
                    className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
