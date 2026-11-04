import { create } from 'zustand';
import { User, LoginPayload } from '../types/auth.types';
import { authService } from '../services/auth.service';

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  login: (payload: LoginPayload) => Promise<boolean>;
  logout: () => Promise<void>;
  clearError: () => void;
}

const getStoredUser = (): User | null => {
  try {
    const raw = localStorage.getItem('ims_user');
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};

export const useAuthStore = create<AuthState>((set) => ({
  user: getStoredUser(),
  token: localStorage.getItem('ims_access_token'),
  isAuthenticated: !!localStorage.getItem('ims_access_token'),
  isLoading: false,
  error: null,

  login: async (payload: LoginPayload) => {
    set({ isLoading: true, error: null });
    try {
      const data = await authService.login(payload);
      localStorage.setItem('ims_access_token', data.access_token);
      localStorage.setItem('ims_user', JSON.stringify(data.user));
      set({
        user: data.user,
        token: data.access_token,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      });
      return true;
    } catch (err: any) {
      const message =
        err.response?.data?.message || 'Tên đăng nhập hoặc mật khẩu không chính xác';
      set({
        isLoading: false,
        error: Array.isArray(message) ? message.join(', ') : message,
      });
      return false;
    }
  },

  logout: async () => {
    await authService.logout();
    localStorage.removeItem('ims_access_token');
    localStorage.removeItem('ims_user');
    set({
      user: null,
      token: null,
      isAuthenticated: false,
      error: null,
    });
  },

  clearError: () => set({ error: null }),
}));

