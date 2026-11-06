import { apiClient } from './api.client';

export interface UserItem {
  id: string;
  username: string;
  display_name: string | null;
  email: string | null;
  phone: string | null;
  role: 'ADMIN' | 'MANAGER' | 'STAFF';
  is_active: boolean;
}

export const usersService = {
  getAll: async (params?: { role?: string; limit?: number }) => {
    try {
      const res = await apiClient.get<{ data: UserItem[] }>('/users', { params });
      return res.data;
    } catch {
      return { data: [] };
    }
  },
};
