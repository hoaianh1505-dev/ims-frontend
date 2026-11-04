export interface Category {
  id: string;
  name: string;
  description?: string;
  parent_id?: string | null;
  parent?: Category | null;
  children?: Category[];
  created_at: string;
  updated_at: string;
}

export interface Unit {
  id: string;
  name: string;
  symbol?: string;
  created_at: string;
  updated_at: string;
}

export interface CreateCategoryDto {
  name: string;
  description?: string;
  parent_id?: string | null;
}

export interface UpdateCategoryDto {
  name?: string;
  description?: string;
  parent_id?: string | null;
}

export interface CreateUnitDto {
  name: string;
  symbol?: string;
}

export interface UpdateUnitDto {
  name?: string;
  symbol?: string;
}

