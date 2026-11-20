import { create } from 'zustand';

export type ThemeMode = 'light' | 'dark' | 'system';
export type AccentColor = 'red' | 'blue' | 'emerald' | 'indigo';
export type DensityMode = 'comfortable' | 'compact';

interface ThemeState {
  theme: ThemeMode;
  accent: AccentColor;
  density: DensityMode;
  soundEnabled: boolean;
  setTheme: (theme: ThemeMode) => void;
  setAccent: (accent: AccentColor) => void;
  setDensity: (density: DensityMode) => void;
  setSoundEnabled: (enabled: boolean) => void;
  toggleTheme: () => void;
}

export const applyThemeToDOM = (theme: ThemeMode) => {
  const root = document.documentElement;
  const isDark =
    theme === 'dark' ||
    (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);

  if (isDark) {
    root.classList.add('dark');
  } else {
    root.classList.remove('dark');
  }
};

const initialTheme = (localStorage.getItem('ims_theme') as ThemeMode) || 'light';
// Áp dụng theme ngay khi app nạp
if (typeof window !== 'undefined') {
  applyThemeToDOM(initialTheme);
}

export const useThemeStore = create<ThemeState>((set, get) => ({
  theme: initialTheme,
  accent: (localStorage.getItem('ims_accent') as AccentColor) || 'red',
  density: (localStorage.getItem('ims_density') as DensityMode) || 'comfortable',
  soundEnabled: localStorage.getItem('ims_sound') !== 'false',

  setTheme: (theme) => {
    localStorage.setItem('ims_theme', theme);
    applyThemeToDOM(theme);
    set({ theme });
  },

  setAccent: (accent) => {
    localStorage.setItem('ims_accent', accent);
    set({ accent });
  },

  setDensity: (density) => {
    localStorage.setItem('ims_density', density);
    set({ density });
  },

  setSoundEnabled: (soundEnabled) => {
    localStorage.setItem('ims_sound', String(soundEnabled));
    set({ soundEnabled });
  },

  toggleTheme: () => {
    const current = get().theme;
    const next: ThemeMode = current === 'light' ? 'dark' : 'light';
    localStorage.setItem('ims_theme', next);
    applyThemeToDOM(next);
    set({ theme: next });
  },
}));
