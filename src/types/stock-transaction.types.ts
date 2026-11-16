import { Product } from './product.types';
import { Supplier } from './supplier.types';
import { Customer } from './customer.types';
import { Warehouse, WarehouseLocation } from './warehouse.types';

export type StockTransactionType = 'IMPORT' | 'EXPORT' | 'TRANSFER' | 'ADJUSTMENT';

export interface TransactionCreator {
  id: string;
  username: string;
  display_name?: string;
  email?: string;
  role?: string;
  avatar?: string | null;
}

export interface StockTransactionItem {
  id: string;
  transaction_id: string;
  product_id: string;
  product?: Product;
  location_id: string | null;
  location?: WarehouseLocation | null;
  target_location_id: string | null;
  target_location?: WarehouseLocation | null;
  quantity: number;
  counted_quantity: number | null;
  unit_price: number;
  total_price: number;
}

export interface StockTransaction {
  id: string;
  type: StockTransactionType;
  reference_no: string;
  warehouse_id: string;
  warehouse?: Warehouse;
  target_warehouse_id: string | null;
  target_warehouse?: Warehouse | null;
  supplier_id: string | null;
  supplier?: Supplier | null;
  customer_id?: string | null;
  customer?: Customer | null;
  created_by_user_id: string;
  creator?: TransactionCreator;
  note: string | null;
  created_at: string;
  items: StockTransactionItem[];
}

export interface ImportStockItemPayload {
  product_id: string;
  location_id?: string;
  quantity: number;
  unit_price?: number;
}

export interface ImportStockPayload {
  warehouse_id: string;
  supplier_id?: string;
  reference_no?: string;
  note?: string;
  items: ImportStockItemPayload[];
}

export interface ExportStockItemPayload {
  product_id: string;
  location_id?: string;
  quantity: number;
  unit_price?: number;
}

export interface ExportStockPayload {
  warehouse_id: string;
  customer_id?: string;
  reference_no?: string;
  note?: string;
  items: ExportStockItemPayload[];
}

export interface TransferStockItemPayload {
  product_id: string;
  location_id?: string;
  target_location_id?: string;
  quantity: number;
}

export interface TransferStockPayload {
  warehouse_id: string;
  target_warehouse_id: string;
  reference_no?: string;
  note?: string;
  items: TransferStockItemPayload[];
}

export interface AdjustStockItemPayload {
  product_id: string;
  location_id?: string;
  counted_quantity: number;
}

export interface AdjustStockPayload {
  warehouse_id: string;
  reference_no?: string;
  note?: string;
  items: AdjustStockItemPayload[];
}

export interface FilterStockTransactionParams {
  page?: number;
  limit?: number;
  type?: StockTransactionType;
  warehouse_id?: string;
  from_date?: string;
  to_date?: string;
  search?: string;
}

export interface PaginatedStockTransactionsResponse {
  data: StockTransaction[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

