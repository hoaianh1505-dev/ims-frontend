export interface Supplier {
  id: string;
  name: string;
  code: string | null;
  contact_name: string | null;
  email: string | null;
  phone: string | null;
  address: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface CreateSupplierPayload {
  name: string;
  code?: string;
  contact_name?: string;
  email?: string;
  phone?: string;
  address?: string;
  is_active?: boolean;
}

export interface UpdateSupplierPayload extends Partial<CreateSupplierPayload> {}

export interface FilterSupplierParams {
  page?: number;
  limit?: number;
  search?: string;
  is_active?: boolean;
}

export interface PaginatedSuppliersResponse {
  data: Supplier[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}
