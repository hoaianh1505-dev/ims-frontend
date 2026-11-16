import { apiClient } from './api.client';
import {
  AppNotification,
  FilterNotificationParams,
  PaginatedNotificationsResponse,
} from '../types/notification.types';

const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

export const notificationsService = {
  async getAll(
    params?: FilterNotificationParams
  ): Promise<PaginatedNotificationsResponse> {
    const res = await apiClient.get<any>('/notifications', { params });
    const payload = res.data;
    return {
      data: payload?.data || (Array.isArray(payload) ? payload : []),
      meta: payload?.meta || {
        total: payload?.data?.length || 0,
        page: params?.page || 1,
        limit: params?.limit || 15,
        totalPages: 1,
      },
    };
  },

  async getUnreadCount(): Promise<number> {
    const res = await apiClient.get<any>('/notifications/unread-count');
    const payload = res.data?.data || res.data;
    return Number(payload?.unread_count || 0);
  },

  async markAsRead(id: string): Promise<AppNotification> {
    const res = await apiClient.patch<any>(`/notifications/${id}/read`);
    return res.data?.data || res.data;
  },

  async markAllAsRead(): Promise<void> {
    await apiClient.patch('/notifications/read-all');
  },

  async delete(id: string): Promise<void> {
    await apiClient.delete(`/notifications/${id}`);
  },

  createEventSource(): EventSource | null {
    const token = localStorage.getItem('ims_access_token');
    if (!token) return null;
    return new EventSource(`${BASE_URL}/notifications/stream?token=${encodeURIComponent(token)}`);
  },
};

