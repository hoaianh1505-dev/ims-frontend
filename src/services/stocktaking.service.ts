import { apiClient, apiCache } from './api.client';
import {
  StocktakingSession,
  FilterStocktakingParams,
  CreateStocktakingPayload,
  UpdateStocktakingCountsPayload,
  PaginatedStocktakingResponse,
} from '../types/stocktaking.types';

export const stocktakingService = {
  async getAll(params?: FilterStocktakingParams): Promise<PaginatedStocktakingResponse> {
    const res = await apiClient.get<any>('/stocktaking', { params });
    const payload = res.data?.data !== undefined && res.data?.meta !== undefined ? res.data : res.data?.data || res.data;
    return {
      data: Array.isArray(payload?.data) ? payload.data : Array.isArray(payload) ? payload : [],
      meta: payload?.meta || {
        page: params?.page || 1,
        limit: params?.limit || 10,
        total: Array.isArray(payload?.data) ? payload.data.length : Array.isArray(payload) ? payload.length : 0,
        totalPages: 1,
      },
    };
  },

  async getById(id: string): Promise<StocktakingSession> {
    const res = await apiClient.get<any>(`/stocktaking/${id}`);
    return res.data?.data || res.data;
  },

  async create(data: CreateStocktakingPayload): Promise<StocktakingSession> {
    const res = await apiClient.post<any>('/stocktaking', data);
    apiCache.invalidate('/stocktaking');
    return res.data?.data || res.data;
  },

  async updateCounts(
    id: string,
    data: UpdateStocktakingCountsPayload
  ): Promise<StocktakingSession> {
    const res = await apiClient.patch<any>(`/stocktaking/${id}/counts`, data);
    apiCache.invalidate('/stocktaking');
    return res.data?.data || res.data;
  },

  async complete(id: string): Promise<StocktakingSession> {
    const res = await apiClient.post<any>(`/stocktaking/${id}/complete`);
    apiCache.invalidate('/stocktaking');
    apiCache.invalidate('/inventory');
    apiCache.invalidate('/products');
    apiCache.invalidate('/dashboard');
    apiCache.invalidate('/stock-transactions');
    return res.data?.data || res.data;
  },

  async cancel(id: string): Promise<StocktakingSession> {
    const res = await apiClient.post<any>(`/stocktaking/${id}/cancel`);
    apiCache.invalidate('/stocktaking');
    return res.data?.data || res.data;
  },

  async delete(id: string): Promise<void> {
    await apiClient.delete(`/stocktaking/${id}`);
    apiCache.invalidate('/stocktaking');
  },
};

