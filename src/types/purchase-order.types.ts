import { Supplier } from './supplier.types';
import { Warehouse } from './warehouse.types';
import { Product } from './product.types';
import { User } from './auth.types';

export type PurchaseOrderStatus =
  | 'DRAFT'
  | 'PENDING_APPROVAL'
  | 'APPROVED'
  | 'ORDERED'
  | 'RECEIVED'
  | 'CANCELLED';

export interface PurchaseOrderItem {
  id?: string;
  purchase_order_id?: string;
  product_id: string;
  product?: Product;
  quantity: number;
  unit_price: number;
  received_quantity?: number;
  total_price?: number;
  note?: string;
}

export interface PurchaseOrder {
  id: string;
  code: string;
  supplier_id: string;
  supplier?: Supplier;
  warehouse_id: string;
  warehouse?: Warehouse;
  created_by_user_id?: string;
  creator?: User;
  approved_by_user_id?: string;
  approver?: User;
  status: PurchaseOrderStatus;
  total_amount: number;
  expected_delivery_date?: string;
  note?: string;
  cancel_reason?: string;
  items: PurchaseOrderItem[];
  created_at: string;
  updated_at: string;
}

export interface CreatePurchaseOrderItemParams {
  product_id: string;
  quantity: number;
  unit_price: number;
  note?: string;
}

export interface CreatePurchaseOrderParams {
  supplier_id: string;
  warehouse_id: string;
  code?: string;
  expected_delivery_date?: string;
  note?: string;
  items: CreatePurchaseOrderItemParams[];
}

export interface FilterPurchaseOrderParams {
  page?: number;
  limit?: number;
  search?: string;
  status?: PurchaseOrderStatus;
  supplier_id?: string;
  warehouse_id?: string;
  from_date?: string;
  to_date?: string;
}

