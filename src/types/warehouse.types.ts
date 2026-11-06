export interface WarehouseLocation {
  id: string;
  warehouse_id: string;
  code: string;
  name: string;
  description: string | null;
  created_at: string;
  updated_at: string;
}

export interface Warehouse {
  id: string;
  name: string;
  code: string;
  address: string | null;
  manager_id: string | null;
  manager?: {
    id: string;
    username: string;
    display_name: string | null;
    email: string | null;
    phone: string | null;
  } | null;
  is_active: boolean;
  locations?: WarehouseLocation[];
  created_at: string;
  updated_at: string;
}

export interface FilterWarehouseParams {
  search?: string;
  is_active?: boolean;
  page?: number;
  limit?: number;
}

export interface CreateWarehouseDto {
  name: string;
  code: string;
  address?: string;
  manager_id?: string | null;
  is_active?: boolean;
}

export interface UpdateWarehouseDto {
  name?: string;
  code?: string;
  address?: string;
  manager_id?: string | null;
  is_active?: boolean;
}

export interface CreateLocationDto {
  code: string;
  name: string;
  description?: string;
}

export interface UpdateLocationDto {
  code?: string;
  name?: string;
  description?: string;
}

