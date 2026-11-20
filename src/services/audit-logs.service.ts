import { apiClient } from './api.client';

export interface AuditLogItem {
  id: string;
  user_id: string | null;
  action: string;
  entity_name: string;
  entity_id: string | null;
  details: Record<string, any> | null;
  ip_address: string | null;
  created_at: string;
  user?: {
    id: string;
    username: string;
    display_name: string | null;
    role: string;
    avatar: string | null;
  } | null;
}

export interface FilterAuditLogsParams {
  page?: number;
  limit?: number;
  user_id?: string;
  action?: string;
  entity_name?: string;
  search?: string;
  from_date?: string;
  to_date?: string;
}

export interface AuditLogsResponse {
  data: AuditLogItem[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export const auditLogsService = {
  async getAll(params?: FilterAuditLogsParams): Promise<AuditLogsResponse> {
    const res = await apiClient.get<any>('/audit-logs', { params });
    const payload = res.data;
    const items = payload?.data?.items || payload?.data || [];
    const meta = payload?.data?.meta || payload?.meta || {
      page: params?.page || 1,
      limit: params?.limit || 20,
      total: Array.isArray(items) ? items.length : 0,
      totalPages: 1,
    };

    return {
      data: Array.isArray(items) ? items : [],
      meta: {
        page: Number(meta.page) || 1,
        limit: Number(meta.limit) || 20,
        total: Number(meta.total) || (Array.isArray(items) ? items.length : 0),
        totalPages: Number(meta.totalPages) || Math.ceil((Number(meta.total) || 1) / (Number(meta.limit) || 20)) || 1,
      },
    };
  },

  async getById(id: string): Promise<AuditLogItem> {
    const res = await apiClient.get<any>(`/audit-logs/${id}`);
    return res.data?.data || res.data;
  },
};

