import { apiClient } from './api.client';
import {
  Supplier,
  CreateSupplierPayload,
  UpdateSupplierPayload,
  FilterSupplierParams,
  PaginatedSuppliersResponse,
} from '../types/supplier.types';

export const suppliersService = {
  async getAll(params?: FilterSupplierParams): Promise<PaginatedSuppliersResponse> {
    const res = await apiClient.get<any>('/suppliers', { params });
    const payload = res.data;
    return {
      data: payload?.data || (Array.isArray(payload) ? payload : []),
      meta: payload?.meta || {
        total: payload?.data?.length || 0,
        page: params?.page || 1,
        limit: params?.limit || 10,
        totalPages: 1,
      },
    };
  },

  async getById(id: string): Promise<Supplier> {
    const res = await apiClient.get<any>(`/suppliers/${id}`);
    return res.data?.data || res.data;
  },

  async create(data: CreateSupplierPayload): Promise<Supplier> {
    const res = await apiClient.post<any>('/suppliers', data);
    return res.data?.data || res.data;
  },

  async update(id: string, data: UpdateSupplierPayload): Promise<Supplier> {
    const res = await apiClient.patch<any>(`/suppliers/${id}`, data);
    return res.data?.data || res.data;
  },

  async delete(id: string): Promise<void> {
    await apiClient.delete(`/suppliers/${id}`);
  },
};
