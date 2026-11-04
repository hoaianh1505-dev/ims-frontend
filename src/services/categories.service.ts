import { apiClient } from './api.client';
import { CreateCategoryDto, UpdateCategoryDto } from '../types/category.types';

export const categoriesService = {
  async getAll(params?: { search?: string; page?: number; limit?: number }) {
    const res = await apiClient.get('/categories', { params });
    return res.data;
  },

  async getOne(id: string) {
    const res = await apiClient.get(`/categories/${id}`);
    return res.data;
  },

  async create(data: CreateCategoryDto) {
    const res = await apiClient.post('/categories', data);
    return res.data;
  },

  async update(id: string, data: UpdateCategoryDto) {
    const res = await apiClient.patch(`/categories/${id}`, data);
    return res.data;
  },

  async delete(id: string) {
    const res = await apiClient.delete(`/categories/${id}`);
    return res.data;
  },
};
