'use client';

import { Users, Lightbulb } from 'lucide-react';

export interface CompanyUser {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: 'admin' | 'manager' | 'staff';
  status: 'active' | 'invited' | 'disabled';
  joinedDate?: Date;
}

interface UsersTableProps {
  users: CompanyUser[];
  isLoading?: boolean;
}

const getRoleBadgeColor = (role: string) => {
  switch (role) {
    case 'admin':
      return 'bg-purple-100 text-purple-800';
    case 'manager':
      return 'bg-blue-100 text-blue-800';
    case 'staff':
      return 'bg-gray-100 text-gray-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

const getStatusBadgeColor = (status: string) => {
  switch (status) {
    case 'active':
      return 'bg-green-100 text-green-800';
    case 'invited':
      return 'bg-yellow-100 text-yellow-800';
    case 'disabled':
      return 'bg-red-100 text-red-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

export function UsersTable({
  users,
  isLoading,
}: UsersTableProps) {

  if (isLoading) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600 mx-auto mb-3"></div>
            <p className="text-gray-500">Loading users...</p>
          </div>
        </div>
      </div>
    );
  }

  if (users.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <div className="flex flex-col items-center justify-center h-64">
          <div className="text-center">
            <div className="flex justify-center mb-4">
              <Users className="w-12 h-12 text-gray-400" />
            </div>
            <p className="text-gray-600 font-medium mb-4">No team members yet</p>
            <p className="text-gray-500 text-sm">Team members will appear here once they're added.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
      <div className="p-6 border-b border-gray-100">
        <h2 className="text-lg font-semibold text-gray-900">Team Members</h2>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-100">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Name
              </th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Email
              </th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Role
              </th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Status
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {users.map((user) => (
              <tr key={user._id} className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4">
                  <div className="text-sm font-medium text-gray-900">
                    {user.firstName} {user.lastName}
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="text-sm text-gray-600">{user.email}</div>
                </td>
                <td className="px-6 py-4">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getRoleBadgeColor(user.role)}`}>
                    {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusBadgeColor(user.status)}`}>
                    {user.status.charAt(0).toUpperCase() + user.status.slice(1)}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="p-4 bg-blue-50 border-t border-gray-100">
        <div className="flex gap-3">
          <Lightbulb className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-blue-900">
            Manage user roles and permissions in the <a href="/admin/users" className="font-semibold text-blue-700 hover:text-blue-800 underline">Admin Users</a> section.
          </p>
        </div>
      </div>
    </div>
  );
}
