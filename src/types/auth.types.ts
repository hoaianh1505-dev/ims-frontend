export interface User {
  id: string;
  username: string;
  email: string;
  full_name: string;
  role: 'ADMIN' | 'MANAGER' | 'STAFF';
  is_active?: boolean;
}

export interface LoginPayload {
  username: string;
  password: string;
}

export interface ApiResponse<T> {
  statusCode: number;
  data: T;
  message?: string;
}

export interface LoginData {
  access_token: string;
  user: User;
}

