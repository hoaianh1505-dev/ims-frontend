import { apiClient } from './api.client';
import { ApiResponse, LoginPayload, LoginData, User } from '../types/auth.types';

export const authService = {
  login: async (payload: LoginPayload): Promise<LoginData> => {
    const res = await apiClient.post<any>('/auth/login', payload);
    return res.data?.data || res.data;
  },

  logout: async (): Promise<void> => {
    try {
      await apiClient.post('/auth/logout');
    } catch (err) {
      console.warn('Logout API error, clearing local session anyway:', err);
    }
  },

  getProfile: async (): Promise<User> => {
    const res = await apiClient.get<ApiResponse<User>>('/auth/profile');
    return res.data.data;
  },

  changePassword: async (currentPassword: string, newPassword: string): Promise<any> => {
    const res = await apiClient.post<ApiResponse<any>>('/auth/change-password', {
      current_password: currentPassword,
      new_password: newPassword,
    });
    return res.data;
  },
};

