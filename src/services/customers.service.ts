import { apiClient } from './api.client';
import {
  Customer,
  CreateCustomerPayload,
  UpdateCustomerPayload,
  FilterCustomerParams,
  PaginatedCustomersResponse,
} from '../types/customer.types';

export const customersService = {
  async getAll(params?: FilterCustomerParams): Promise<PaginatedCustomersResponse> {
    const res = await apiClient.get<any>('/customers', { params });
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

  async getById(id: string): Promise<Customer> {
    const res = await apiClient.get<any>(`/customers/${id}`);
    return res.data?.data || res.data;
  },

  async create(data: CreateCustomerPayload): Promise<Customer> {
    const res = await apiClient.post<any>('/customers', data);
    return res.data?.data || res.data;
  },

  async update(id: string, data: UpdateCustomerPayload): Promise<Customer> {
    const res = await apiClient.patch<any>(`/customers/${id}`, data);
    return res.data?.data || res.data;
  },

  async delete(id: string): Promise<void> {
    await apiClient.delete(`/customers/${id}`);
  },

  async getTransactions(id: string): Promise<any[]> {
    const res = await apiClient.get<any>(`/customers/${id}/transactions`);
    return res.data?.data || (Array.isArray(res.data) ? res.data : []);
  },
};

