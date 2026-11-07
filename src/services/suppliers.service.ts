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
    const res = await apiClient.get<PaginatedSuppliersResponse>('/suppliers', { params });
    return res.data;
  },

  async getById(id: string): Promise<Supplier> {
    const res = await apiClient.get<Supplier>(`/suppliers/${id}`);
    return res.data;
  },

  async create(data: CreateSupplierPayload): Promise<Supplier> {
    const res = await apiClient.post<Supplier>('/suppliers', data);
    return res.data;
  },

  async update(id: string, data: UpdateSupplierPayload): Promise<Supplier> {
    const res = await apiClient.patch<Supplier>(`/suppliers/${id}`, data);
    return res.data;
  },

  async delete(id: string): Promise<void> {
    await apiClient.delete(`/suppliers/${id}`);
  },
};
