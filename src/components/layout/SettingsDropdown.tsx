import React, { useState, useEffect } from 'react';
import {
  Settings,
  Sun,
  Moon,
  Monitor,
  RotateCcw,
} from 'lucide-react';
import { useThemeStore } from '../../stores/theme.store';
import { apiCache } from '../../services/api.client';
import { showToast } from '../../utils/toast.util';

export const SettingsDropdown: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { theme, setTheme } = useThemeStore();
  const [cacheCount, setCacheCount] = useState(0);

  useEffect(() => {
    if (isOpen) {
      setCacheCount(apiCache.size());
    }
  }, [isOpen]);

  const handleClearCache = () => {
    apiCache.clear();
    setCacheCount(0);
    showToast.success('Đã làm mới dữ liệu bộ nhớ đệm!');
  };

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="p-1.5 sm:p-2 text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-100 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer relative group"
        title="Cài đặt giao diện"
      >
        <Settings className="w-5 h-5 transition-transform duration-300 group-hover:rotate-45" />
      </button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-30"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute right-0 top-12 z-40 w-72 bg-white dark:bg-[#161b22] rounded-2xl shadow-xl border border-slate-200 dark:border-slate-800 py-3 px-4 text-xs animate-in fade-in zoom-in-95 duration-100">
            {/* Header */}
            <div className="flex items-center justify-between pb-2.5 border-b border-slate-100 dark:border-slate-800 font-bold text-slate-800 dark:text-slate-100 text-sm">
              <span>Cài đặt hệ thống</span>
            </div>

            <div className="space-y-3.5 pt-3">
              {/* 1. Theme Mode (Sáng / Tối / Tự động) */}
              <div>
                <label className="font-semibold text-slate-600 dark:text-slate-400 block mb-1.5 text-[11px] uppercase tracking-wider">
                  Giao diện (Theme)
                </label>
                <div className="grid grid-cols-3 gap-1 p-1 bg-slate-100 dark:bg-slate-800/80 rounded-xl">
                  <button
                    type="button"
                    onClick={() => setTheme('light')}
                    className={`flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-lg font-medium transition-all cursor-pointer ${
                      theme === 'light'
                        ? 'bg-white text-slate-900 shadow-xs font-bold'
                        : 'text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100'
                    }`}
                  >
                    <Sun className="w-3.5 h-3.5" />
                    <span>Sáng</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setTheme('dark')}
                    className={`flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-lg font-medium transition-all cursor-pointer ${
                      theme === 'dark'
                        ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs font-bold'
                        : 'text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100'
                    }`}
                  >
                    <Moon className="w-3.5 h-3.5" />
                    <span>Tối</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setTheme('system')}
                    className={`flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-lg font-medium transition-all cursor-pointer ${
                      theme === 'system'
                        ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs font-bold'
                        : 'text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100'
                    }`}
                  >
                    <Monitor className="w-3.5 h-3.5" />
                    <span>Tự động</span>
                  </button>
                </div>
              </div>

              {/* 2. Dữ liệu Cache */}
              <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <div>
                  <div className="font-semibold text-slate-800 dark:text-slate-200 text-xs">
                    Bộ nhớ đệm
                  </div>
                  <div className="text-[11px] text-slate-400 mt-0.5">
                    {cacheCount} danh sách lưu đệm
                  </div>
                </div>
                <button
                  type="button"
                  onClick={handleClearCache}
                  className="px-2.5 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-semibold transition-colors flex items-center gap-1.5 cursor-pointer"
                  title="Xóa cache và tải mới dữ liệu từ server"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Làm mới</span>
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};
