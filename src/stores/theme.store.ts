// Theme store deprecated - toàn bộ hệ thống sử dụng Light Mode chuẩn chỉ với sidebar đen
export const useThemeStore = () => ({
  theme: 'light' as const,
  toggleTheme: () => {},
  setTheme: () => {},
});
