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

export interface StockMovementItem {
  date: string;
  imports: number;
  exports: number;
}

export interface InventoryByWarehouse {
  warehouse_id: string;
  warehouse_code: string;
  warehouse_name: string;
  total_quantity: number;
  total_value: number;
  product_count: number;
}

export interface InventoryByCategory {
  category_id: string;
  category_name: string;
  product_count: number;
  total_quantity: number;
  total_value: number;
  percentage: number;
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

export interface LowStockAlert {
  product_id: string;
  sku: string;
  name: string;
  category_name: string;
  unit_name: string;
  current_stock: number;
  low_stock_threshold: number;
  status: 'LOW_STOCK' | 'OUT_OF_STOCK';
}

export interface RecentTransaction {
  id: string;
  reference_no: string;
  type: string;
  warehouse_name: string;
  creator_name: string;
  item_count: number;
  created_at: string;
}

export const dashboardService = {
  getStats: async (): Promise<DashboardStats> => {
    const res = await apiClient.get<any>('/dashboard/stats');
    return res.data?.data || res.data;
  },

  getStockMovement: async (period = '7d'): Promise<StockMovementItem[]> => {
    const res = await apiClient.get<any>('/dashboard/stock-movement', { params: { period } });
    return res.data?.data || res.data || [];
  },

  getInventoryByWarehouse: async (): Promise<InventoryByWarehouse[]> => {
    const res = await apiClient.get<any>('/dashboard/inventory-by-warehouse');
    return res.data?.data || res.data || [];
  },

  getInventoryByCategory: async (): Promise<InventoryByCategory[]> => {
    const res = await apiClient.get<any>('/dashboard/inventory-by-category');
    return res.data?.data || res.data || [];
  },

  getTopProducts: async (): Promise<TopProduct[]> => {
    const res = await apiClient.get<any>('/dashboard/top-products');
    return res.data?.data || res.data || [];
  },

  getLowStockAlerts: async (): Promise<LowStockAlert[]> => {
    const res = await apiClient.get<any>('/dashboard/low-stock-alerts');
    return res.data?.data || res.data || [];
  },

  getRecentTransactions: async (): Promise<RecentTransaction[]> => {
    const res = await apiClient.get<any>('/dashboard/recent-transactions');
    return res.data?.data || res.data || [];
  },
};
