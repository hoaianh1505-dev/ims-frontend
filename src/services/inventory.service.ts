import { apiClient } from './api.client';

export interface ProductInventoryLocation {
  location: {
    id: string;
    name: string;
    code: string;
  } | null;
  quantity: number;
  updated_at: string;
}

export interface ProductInventoryWarehouseGroup {
  warehouse: {
    id: string;
    name: string;
    code: string;
  };
  total_in_warehouse: number;
  locations: ProductInventoryLocation[];
}

export interface ProductInventoryBreakdown {
  product: {
    id: string;
    name: string;
    sku: string;
    barcode?: string | null;
    low_stock_threshold: number;
  };
  total_quantity: number;
  warehouses: ProductInventoryWarehouseGroup[];
}

export interface FilterInventoryParams {
  page?: number;
  limit?: number;
  warehouse_id?: string;
  location_id?: string;
  product_id?: string;
  search?: string;
}

export const inventoryService = {
  async getAll(params?: FilterInventoryParams) {
    const res = await apiClient.get<any>('/inventory', { params });
    return res.data?.data !== undefined && res.data?.meta !== undefined
      ? res.data
      : res.data?.data || res.data;
  },

  async getLowStock(params?: {
    page?: number;
    limit?: number;
    warehouse_id?: string;
    category_id?: string;
    search?: string;
  }) {
    const res = await apiClient.get<any>('/inventory/low-stock', { params });
    return res.data?.data !== undefined && res.data?.meta !== undefined
      ? res.data
      : res.data?.data || res.data;
  },

  async getByProduct(productId: string): Promise<ProductInventoryBreakdown> {
    const res = await apiClient.get<any>(`/inventory/product/${productId}`);
    return res.data?.data || res.data;
  },

  async getByWarehouse(warehouseId: string) {
    const res = await apiClient.get<any>(`/inventory/warehouse/${warehouseId}`);
    return res.data?.data || res.data;
  },
};

