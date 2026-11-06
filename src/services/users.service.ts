import { apiClient } from './api.client';

export type UserRole = 'ADMIN' | 'MANAGER' | 'STAFF';

export interface UserItem {
  id: string;
  username: string;
  display_name: string | null;
  email: string | null;
  phone: string | null;
  avatar: string | null;
  role: UserRole;
  is_active: boolean;
  must_change_password: boolean;
  created_at: string;
}

export interface CreateUserData {
  username: string;
  password: string;
  display_name?: string;
  email?: string;
  phone?: string;
  role?: UserRole;
}

export interface UpdateUserData {
  display_name?: string;
  email?: string;
  phone?: string;
  role?: UserRole;
  is_active?: boolean;
}

export interface ResetPasswordResponse {
  message: string;
  user_id: string;
  username: string;
  temp_password: string;
}

export interface RoleInfo {
  role: UserRole;
  name: string;
  description: string;
}

export const usersService = {
  getAll: async (params?: {
    page?: number;
    limit?: number;
    role?: string;
    is_active?: boolean;
    search?: string;
  }) => {
    const res = await apiClient.get<{
      data: UserItem[];
      meta: { page: number; limit: number; total: number };
    }>('/users', { params });
    return res.data;
  },

  getRoles: async () => {
    const res = await apiClient.get<RoleInfo[]>('/users/roles');
    return res.data;
  },

  getById: async (id: string) => {
    const res = await apiClient.get<UserItem>(`/users/${id}`);
    return res.data;
  },

  create: async (data: CreateUserData) => {
    const res = await apiClient.post<UserItem>('/users', data);
    return res.data;
  },

  update: async (id: string, data: UpdateUserData) => {
    const res = await apiClient.patch<UserItem>(`/users/${id}`, data);
    return res.data;
  },

  resetPassword: async (id: string, new_password?: string) => {
    const res = await apiClient.patch<ResetPasswordResponse>(
      `/users/${id}/reset-password`,
      new_password ? { new_password } : {}
    );
    return res.data;
  },

  delete: async (id: string) => {
    const res = await apiClient.delete<{ success: boolean; message?: string }>(`/users/${id}`);
    return res.data;
  },
};
