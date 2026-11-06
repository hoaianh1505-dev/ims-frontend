import { apiClient } from './api.client';

export interface DashboardStats {
  total_products: number;
  total_warehouses: number;
  total_inventory_quantity: number;
  total_inventory_value: number;
  low_stock_count: number;
  out_of_stock_count: number;
  transactions_today: number;
  transactions_this_month: number;
}

export interface TopProduct {
  product_id: string;
  sku: string;
  name: string;
  category_name: string;
  unit_name: string;
  total_quantity: number;
  total_value: number;
}

export const dashboardService = {
  getStats: async (): Promise<DashboardStats> => {
    const res = await apiClient.get<{ data: DashboardStats }>('/dashboard/stats');
    return res.data?.data || res.data;
  },

  getTopProducts: async (): Promise<TopProduct[]> => {
    const res = await apiClient.get<{ data: TopProduct[] }>('/dashboard/top-products');
    return res.data?.data || res.data;
  },
};

