import { api } from "@/lib/api-client";
import type {
  GroupedUsersResponse,
  ManagedUser,
  UserFormValues,
  UserListFilters,
  UserResponse,
  UsersListResponse,
} from "./types";

const buildUserQuery = (filters?: UserListFilters) => {
  const query = new URLSearchParams();

  if (filters?.companyId) query.append("companyId", filters.companyId);
  if (filters?.role) query.append("role", filters.role);
  if (filters?.status) query.append("status", filters.status);
  if (filters?.page) query.append("page", filters.page.toString());
  if (filters?.limit) query.append("limit", filters.limit.toString());

  const queryString = query.toString();
  return queryString ? `?${queryString}` : "";
};

export const usersService = {
  async getUsers(filters?: UserListFilters): Promise<UsersListResponse> {
    return api.get<UsersListResponse>(`/users${buildUserQuery(filters)}`);
  },

  async getGroupedUsers(): Promise<GroupedUsersResponse> {
    return api.get<GroupedUsersResponse>("/users/grouped");
  },

  async getUser(id: string): Promise<ManagedUser> {
    const response = await api.get<UserResponse>(`/users/${id}`);
    return response.data;
  },

  async createUser(values: UserFormValues): Promise<ManagedUser> {
    const payload = {
      ...values,
      password: values.password || undefined,
    };
    const response = await api.post<UserResponse>("/users", payload);
    return response.data;
  },

  async updateUser(id: string, values: Partial<UserFormValues>): Promise<ManagedUser> {
    const response = await api.put<UserResponse>(`/users/${id}`, values);
    return response.data;
  },

  async toggleStatus(id: string): Promise<ManagedUser> {
    const response = await api.patch<UserResponse>(`/users/${id}/status`);
    return response.data;
  },
};
