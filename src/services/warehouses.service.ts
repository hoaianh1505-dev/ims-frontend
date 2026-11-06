import { apiClient } from './api.client';
import {
  Warehouse,
  WarehouseLocation,
  FilterWarehouseParams,
  CreateWarehouseDto,
  UpdateWarehouseDto,
  CreateLocationDto,
  UpdateLocationDto,
} from '../types/warehouse.types';

export const warehousesService = {
  // Warehouses
  getAll: async (params?: FilterWarehouseParams) => {
    const res = await apiClient.get<{
      data: Warehouse[];
      meta?: { total: number; page: number; limit: number; totalPages: number };
    }>('/warehouses', { params });
    return res.data;
  },

  getById: async (id: string) => {
    const res = await apiClient.get<Warehouse>(`/warehouses/${id}`);
    return res.data;
  },

  create: async (data: CreateWarehouseDto) => {
    const res = await apiClient.post<Warehouse>('/warehouses', data);
    return res.data;
  },

  update: async (id: string, data: UpdateWarehouseDto) => {
    const res = await apiClient.patch<Warehouse>(`/warehouses/${id}`, data);
    return res.data;
  },

  delete: async (id: string) => {
    const res = await apiClient.delete(`/warehouses/${id}`);
    return res.data;
  },

  // Locations in Warehouse
  getLocations: async (warehouseId: string) => {
    const res = await apiClient.get<WarehouseLocation[]>(`/warehouses/${warehouseId}/locations`);
    return res.data;
  },

  createLocation: async (warehouseId: string, data: CreateLocationDto) => {
    const res = await apiClient.post<WarehouseLocation>(`/warehouses/${warehouseId}/locations`, data);
    return res.data;
  },

  updateLocation: async (locationId: string, data: UpdateLocationDto) => {
    const res = await apiClient.patch<WarehouseLocation>(`/locations/${locationId}`, data);
    return res.data;
  },

  deleteLocation: async (locationId: string) => {
    const res = await apiClient.delete(`/locations/${locationId}`);
    return res.data;
  },
};
