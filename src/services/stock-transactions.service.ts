import { apiClient } from './api.client';
import {
  StockTransaction,
  ImportStockPayload,
  ExportStockPayload,
  TransferStockPayload,
  AdjustStockPayload,
  FilterStockTransactionParams,
  PaginatedStockTransactionsResponse,
} from '../types/stock-transaction.types';

export interface WarehouseInventoryRecord {
  id: string;
  warehouse_id: string;
  location_id: string | null;
  product_id: string;
  quantity: number;
  location?: {
    id: string;
    code: string;
    name: string;
  } | null;
  product?: {
    id: string;
    name: string;
    sku: string;
    cost_price: number;
    selling_price: number;
  };
}

export const stockTransactionsService = {
  async getAll(
    params?: FilterStockTransactionParams
  ): Promise<PaginatedStockTransactionsResponse> {
    const res = await apiClient.get<any>('/stock-transactions', { params });
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

  async getById(id: string): Promise<StockTransaction> {
    const res = await apiClient.get<any>(`/stock-transactions/${id}`);
    return res.data?.data || res.data;
  },

  async createImport(data: ImportStockPayload): Promise<StockTransaction> {
    const res = await apiClient.post<any>('/stock-transactions/import', data);
    return res.data?.data || res.data;
  },

  async createExport(data: ExportStockPayload): Promise<StockTransaction> {
    const res = await apiClient.post<any>('/stock-transactions/export', data);
    return res.data?.data || res.data;
  },

  async createTransfer(data: TransferStockPayload): Promise<StockTransaction> {
    const res = await apiClient.post<any>('/stock-transactions/transfer', data);
    return res.data?.data || res.data;
  },

  async createAdjustment(data: AdjustStockPayload): Promise<StockTransaction> {
    const res = await apiClient.post<any>('/stock-transactions/adjustment', data);
    return res.data?.data || res.data;
  },

  async getWarehouseInventory(warehouseId: string): Promise<WarehouseInventoryRecord[]> {
    const res = await apiClient.get<any>(`/inventory/warehouse/${warehouseId}`);
    const payload = res.data?.data || res.data;
    return payload?.items || [];
  },

  async exportExcel(params?: FilterStockTransactionParams): Promise<void> {
    const res = await apiClient.get('/export/stock-transactions', {
      params,
      responseType: 'blob',
    });
    const blob = new Blob([res.data], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Lich_Su_Xuat_Nhap_Kho_${new Date().toISOString().slice(0, 10)}.xlsx`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  },
};

