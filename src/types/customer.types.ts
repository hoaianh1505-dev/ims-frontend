export type CustomerType = 'RETAIL' | 'WHOLESALE' | 'DISTRIBUTOR';

export interface Customer {
  id: string;
  code: string;
  name: string;
  phone: string | null;
  email: string | null;
  address: string | null;
  type: CustomerType;
  tax_id: string | null;
  debt_limit: number;
  current_debt: number;
  is_active: boolean;
  note: string | null;
  created_at: string;
  updated_at: string;
}

export interface CreateCustomerPayload {
  name: string;
  code?: string;
  phone?: string;
  email?: string;
  address?: string;
  type?: CustomerType;
  tax_id?: string;
  debt_limit?: number;
  is_active?: boolean;
  note?: string;
}

export interface UpdateCustomerPayload {
  name?: string;
  code?: string;
  phone?: string;
  email?: string;
  address?: string;
  type?: CustomerType;
  tax_id?: string;
  debt_limit?: number;
  is_active?: boolean;
  note?: string;
}

export interface FilterCustomerParams {
  page?: number;
  limit?: number;
  type?: CustomerType;
  is_active?: boolean;
  search?: string;
}

export interface PaginatedCustomersResponse {
  data: Customer[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

