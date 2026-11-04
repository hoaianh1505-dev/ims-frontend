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
};

