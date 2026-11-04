import { apiClient } from './api.client';
import { CreateUnitDto, UpdateUnitDto } from '../types/category.types';

export const unitsService = {
  async getAll(params?: { search?: string; page?: number; limit?: number }) {
    const res = await apiClient.get('/units', { params });
    return res.data;
  },

  async getOne(id: string) {
    const res = await apiClient.get(`/units/${id}`);
    return res.data;
  },

  async create(data: CreateUnitDto) {
    const res = await apiClient.post('/units', data);
    return res.data;
  },

  async update(id: string, data: UpdateUnitDto) {
    const res = await apiClient.patch(`/units/${id}`, data);
    return res.data;
  },

  async delete(id: string) {
    const res = await apiClient.delete(`/units/${id}`);
    return res.data;
  },
};
