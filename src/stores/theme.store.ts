import { create } from 'zustand';

export type ThemeMode = 'light' | 'dark';

interface ThemeState {
  theme: ThemeMode;
  toggleTheme: () => void;
  setTheme: (theme: ThemeMode) => void;
}

const getInitialTheme = (): ThemeMode => {
  if (typeof window === 'undefined') return 'light';
  const saved = localStorage.getItem('ims_theme') as ThemeMode;
  if (saved === 'dark' || saved === 'light') return saved;
  // Mặc định kiểm tra preference hoặc ưu tiên dark nếu hệ thống bật
  return window.matchMedia?.('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
};

const applyThemeToDOM = (theme: ThemeMode) => {
  const root = document.documentElement;
  if (theme === 'dark') {
    root.classList.add('dark');
  } else {
    root.classList.remove('dark');
  }
  localStorage.setItem('ims_theme', theme);
};

export const useThemeStore = create<ThemeState>((set, get) => {
  const initialTheme = getInitialTheme();
  // Khởi tạo class trên DOM ngay khi nạp module
  if (typeof window !== 'undefined') {
    applyThemeToDOM(initialTheme);
  }

  return {
    theme: initialTheme,
    toggleTheme: () => {
      const next: ThemeMode = get().theme === 'dark' ? 'light' : 'dark';
      applyThemeToDOM(next);
      set({ theme: next });
    },
    setTheme: (theme: ThemeMode) => {
      applyThemeToDOM(theme);
      set({ theme });
    },
  };
});
