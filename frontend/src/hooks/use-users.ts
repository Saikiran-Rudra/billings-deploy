"use client";

import { useCallback, useState } from "react";
import { getAllCompanies } from "@/services/company.api";
import type { Company } from "@/types";
import { usersService } from "@/modules/users/service";
import type { ManagedUser, UserFormValues, UserListFilters } from "@/modules/users/types";

interface UseUsersReturn {
  users: ManagedUser[];
  companies: Company[];
  selectedUser: ManagedUser | null;
  loading: boolean;
  error: string | null;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
  fetchUsers: (filters?: UserListFilters) => Promise<void>;
  fetchUser: (id: string) => Promise<ManagedUser | null>;
  fetchCompanies: () => Promise<void>;
  createUser: (values: UserFormValues) => Promise<ManagedUser>;
  updateUser: (id: string, values: Partial<UserFormValues>) => Promise<ManagedUser>;
  toggleStatus: (id: string) => Promise<ManagedUser>;
  setError: (error: string | null) => void;
}

export const useUsers = (): UseUsersReturn => {
  const [users, setUsers] = useState<ManagedUser[]>([]);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [selectedUser, setSelectedUser] = useState<ManagedUser | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState<UseUsersReturn["pagination"]>();

  const handleError = (err: unknown, fallback: string) => {
    const message = err instanceof Error ? err.message : fallback;
    setError(message);
    return message;
  };

  const fetchUsers = useCallback(async (filters?: UserListFilters) => {
    setLoading(true);
    setError(null);

    try {
      const response = await usersService.getUsers(filters);
      setUsers(response.data);
      setPagination(response.pagination);
    } catch (err) {
      handleError(err, "Failed to fetch users");
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchUser = useCallback(async (id: string) => {
    setLoading(true);
    setError(null);

    try {
      const user = await usersService.getUser(id);
      setSelectedUser(user);
      return user;
    } catch (err) {
      handleError(err, "Failed to fetch user");
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchCompanies = useCallback(async () => {
    setError(null);

    try {
      const response = await getAllCompanies(1, 100);
      setCompanies(response.data);
    } catch (err) {
      handleError(err, "Failed to fetch companies");
    }
  }, []);

  const createUser = useCallback(async (values: UserFormValues) => {
    setLoading(true);
    setError(null);

    try {
      const user = await usersService.createUser(values);
      setUsers((current) => [user, ...current]);
      return user;
    } catch (err) {
      handleError(err, "Failed to create user");
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const updateUser = useCallback(async (id: string, values: Partial<UserFormValues>) => {
    setLoading(true);
    setError(null);

    try {
      const user = await usersService.updateUser(id, values);
      setSelectedUser(user);
      setUsers((current) => current.map((item) => (item.id === id ? user : item)));
      return user;
    } catch (err) {
      handleError(err, "Failed to update user");
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const toggleStatus = useCallback(async (id: string) => {
    setLoading(true);
    setError(null);

    try {
      const user = await usersService.toggleStatus(id);
      setUsers((current) => current.map((item) => (item.id === id ? user : item)));
      setSelectedUser((current) => (current?.id === id ? user : current));
      return user;
    } catch (err) {
      handleError(err, "Failed to update user status");
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    users,
    companies,
    selectedUser,
    loading,
    error,
    pagination,
    fetchUsers,
    fetchUser,
    fetchCompanies,
    createUser,
    updateUser,
    toggleStatus,
    setError,
  };
};
