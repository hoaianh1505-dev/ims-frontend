export type StocktakingStatus = 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';

export interface StocktakingItem {
  id: string;
  session_id: string;
  product_id: string;
  location_id: string | null;
  system_quantity: number;
  counted_quantity: number | null;
  diff_quantity: number;
  unit_cost: number;
  diff_amount: number;
  note: string | null;
  product?: {
    id: string;
    sku: string;
    name: string;
    cost_price?: number;
    unit?: { id: string; name: string } | null;
    category?: { id: string; name: string } | null;
  };
  location?: {
    id: string;
    code: string;
    name: string;
  } | null;
}

export interface StocktakingSession {
  id: string;
  code: string;
  title: string;
  warehouse_id: string;
  status: StocktakingStatus;
  created_by_user_id: string;
  completed_by_user_id: string | null;
  completed_at: string | null;
  total_system_quantity: number;
  total_counted_quantity: number;
  total_diff_quantity: number;
  total_diff_amount: number;
  note: string | null;
  adjustment_transaction_id: string | null;
  created_at: string;
  updated_at: string;
  warehouse?: {
    id: string;
    code: string;
    name: string;
  };
  creator?: {
    id: string;
    username: string;
    display_name?: string;
  };
  completer?: {
    id: string;
    username: string;
    display_name?: string;
  } | null;
  adjustment_transaction?: {
    id: string;
    reference_no: string;
  } | null;
  items?: StocktakingItem[];
}

export interface FilterStocktakingParams {
  page?: number;
  limit?: number;
  warehouse_id?: string;
  status?: StocktakingStatus;
  from_date?: string;
  to_date?: string;
  search?: string;
}

export interface CreateStocktakingPayload {
  warehouse_id: string;
  title: string;
  code?: string;
  note?: string;
  product_ids?: string[];
}

export interface UpdateStocktakingCountItem {
  item_id: string;
  counted_quantity: number;
  note?: string;
}

export interface UpdateStocktakingCountsPayload {
  items: UpdateStocktakingCountItem[];
}

export interface PaginatedStocktakingResponse {
  data: StocktakingSession[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

