import { apiClient } from './api.client';
import { Product, FilterProductParams } from '../types/product.types';

export const productsService = {
  async getAll(params?: FilterProductParams) {
    const res = await apiClient.get('/products', { params });
    return res.data;
  },

  async getOne(id: string) {
    const res = await apiClient.get(`/products/${id}`);
    return res.data;
  },

  async create(data: Partial<Product>) {
    const res = await apiClient.post('/products', data);
    return res.data;
  },

  async update(id: string, data: Partial<Product>) {
    const res = await apiClient.patch(`/products/${id}`, data);
    return res.data;
  },

  async delete(id: string) {
    const res = await apiClient.delete(`/products/${id}`);
    return res.data;
  },

  async uploadImage(productId: string, file: File, isPrimary?: boolean) {
    const formData = new FormData();
    formData.append('file', file);
    if (isPrimary !== undefined) {
      formData.append('is_primary', String(isPrimary));
    }
    const res = await apiClient.post(`/products/${productId}/images`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return res.data;
  },

  async deleteImage(productId: string, imageId: string) {
    const res = await apiClient.delete(`/products/${productId}/images/${imageId}`);
    return res.data;
  },

  async setPrimaryImage(productId: string, imageId: string) {
    const res = await apiClient.patch(`/products/${productId}/images/${imageId}/primary`);
    return res.data;
  },

  async exportInventoryExcel(params?: any): Promise<void> {
    const res = await apiClient.get('/export/inventory', {
      params,
      responseType: 'blob',
    });
    const blob = new Blob([res.data], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Bao_Cao_Ton_Kho_${new Date().toISOString().slice(0, 10)}.xlsx`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  },
};

