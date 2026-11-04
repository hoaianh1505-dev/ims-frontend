import { Category, Unit } from './category.types';

export interface Supplier {
  id: string;
  name: string;
  code?: string;
  contact_person?: string;
  phone?: string;
  email?: string;
  address?: string;
}

export interface ProductImage {
  id: string;
  product_id: string;
  image_url: string;
  is_primary: boolean;
}

export interface Product {
  id: string;
  sku: string;
  barcode?: string;
  name: string;
  description?: string;
  cost_price: number;
  selling_price: number;
  low_stock_threshold: number;
  category_id?: string;
  unit_id?: string;
  supplier_id?: string;
  category?: Category;
  unit?: Unit;
  supplier?: Supplier;
  images?: ProductImage[];
  created_at: string;
  updated_at: string;
}

export interface FilterProductParams {
  page?: number;
  limit?: number;
  search?: string;
  category_id?: string;
  supplier_id?: string;
  unit_id?: string;
}
