import { apiClient } from './api.client';
import {
  PurchaseOrder,
  CreatePurchaseOrderParams,
  FilterPurchaseOrderParams,
} from '../types/purchase-order.types';

export const purchaseOrdersService = {
  async getAll(params?: FilterPurchaseOrderParams) {
    const res = await apiClient.get('/purchase-orders', { params });
    return res.data;
  },

  async getOne(id: string): Promise<PurchaseOrder> {
    const res = await apiClient.get(`/purchase-orders/${id}`);
    return res.data?.data || res.data;
  },

  async create(data: CreatePurchaseOrderParams) {
    const res = await apiClient.post('/purchase-orders', data);
    return res.data;
  },

  async update(id: string, data: Partial<CreatePurchaseOrderParams>) {
    const res = await apiClient.patch(`/purchase-orders/${id}`, data);
    return res.data;
  },

  async submitForApproval(id: string) {
    const res = await apiClient.post(`/purchase-orders/${id}/submit`);
    return res.data;
  },

  async approve(id: string) {
    const res = await apiClient.post(`/purchase-orders/${id}/approve`);
    return res.data;
  },

  async markAsOrdered(id: string) {
    const res = await apiClient.post(`/purchase-orders/${id}/order`);
    return res.data;
  },

  async receive(
    id: string,
    data: {
      received_date?: string;
      note?: string;
      items: Array<{
        product_id: string;
        received_quantity: number;
        location_id?: string;
      }>;
    }
  ) {
    const res = await apiClient.post(`/purchase-orders/${id}/receive`, data);
    return res.data;
  },

  async cancel(id: string, reason?: string) {
    const res = await apiClient.post(`/purchase-orders/${id}/cancel`, { reason });
    return res.data;
  },

  async delete(id: string) {
    const res = await apiClient.delete(`/purchase-orders/${id}`);
    return res.data;
  },
};

