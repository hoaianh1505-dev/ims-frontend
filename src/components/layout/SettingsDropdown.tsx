import React, { useState, useEffect } from 'react';
import {
  Settings,
  Sun,
  Moon,
  Monitor,
  RotateCcw,
  Sparkles,
  Database,
  Sliders,
} from 'lucide-react';
import { useThemeStore, AccentColor } from '../../stores/theme.store';
import { apiCache } from '../../services/api.client';
import { showToast } from '../../utils/toast.util';

export const SettingsDropdown: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { theme, setTheme, accent, setAccent } = useThemeStore();
  const [cacheCount, setCacheCount] = useState(0);

  useEffect(() => {
    if (isOpen) {
      setCacheCount(apiCache.size());
    }
  }, [isOpen]);

  const handleClearCache = () => {
    apiCache.clear();
    setCacheCount(0);
    showToast.success('Đã xóa toàn bộ bộ nhớ đệm! Các trang sẽ tải lại dữ liệu mới nhất.');
  };

  const handleOpenAiAssistant = () => {
    setIsOpen(false);
    window.dispatchEvent(new CustomEvent('open-ai-assistant'));
  };

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="p-1.5 sm:p-2 text-slate-500 hover:text-slate-800 rounded-xl hover:bg-slate-100 transition-colors cursor-pointer relative group"
        title="Cài đặt giao diện & hệ thống"
      >
        <Settings className="w-5 h-5 transition-transform duration-300 group-hover:rotate-45" />
      </button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-30"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute right-0 top-12 z-40 w-80 sm:w-88 bg-white rounded-2xl shadow-2xl border border-slate-200/90 py-3.5 px-4 text-xs animate-in fade-in zoom-in-95 duration-150">
            {/* Header */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2 font-bold text-sm text-slate-800">
                <Sliders className="w-4 h-4 text-[#EE3D43]" />
                <span>Cài đặt & Tùy chỉnh</span>
              </div>
              <span className="text-[10px] font-semibold text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full">
                Hệ thống IMS
              </span>
            </div>

            <div className="space-y-4 pt-3.5">
              {/* 1. Theme Mode */}
              <div>
                <label className="font-bold text-slate-700 block mb-2">
                  Chế độ giao diện (Theme)
                </label>
                <div className="grid grid-cols-3 gap-1.5 p-1 bg-slate-100 rounded-xl">
                  <button
                    type="button"
                    onClick={() => {
                      setTheme('light');
                      showToast.success('Đã áp dụng giao diện Sáng chuẩn!');
                    }}
                    className={`flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-lg font-semibold transition-all cursor-pointer ${
                      theme === 'light'
                        ? 'bg-white text-slate-900 shadow-xs'
                        : 'text-slate-500 hover:text-slate-900'
                    }`}
                  >
                    <Sun className="w-3.5 h-3.5 text-amber-500" />
                    <span>Sáng</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setTheme('dark');
                      showToast.info('Đã bật chế độ Tối (Dark theme)');
                    }}
                    className={`flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-lg font-semibold transition-all cursor-pointer ${
                      theme === 'dark'
                        ? 'bg-white text-slate-900 shadow-xs'
                        : 'text-slate-500 hover:text-slate-900'
                    }`}
                  >
                    <Moon className="w-3.5 h-3.5 text-indigo-500" />
                    <span>Tối</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setTheme('system');
                      showToast.info('Giao diện tự động theo thiết bị');
                    }}
                    className={`flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-lg font-semibold transition-all cursor-pointer ${
                      theme === 'system'
                        ? 'bg-white text-slate-900 shadow-xs'
                        : 'text-slate-500 hover:text-slate-900'
                    }`}
                  >
                    <Monitor className="w-3.5 h-3.5 text-slate-500" />
                    <span>Tự động</span>
                  </button>
                </div>
              </div>

              {/* 2. Accent Color */}
              <div>
                <label className="font-bold text-slate-700 block mb-2">
                  Màu sắc điểm nhấn
                </label>
                <div className="flex items-center gap-2">
                  {[
                    { id: 'red', name: 'Đỏ IMS', color: '#EE3D43' },
                    { id: 'blue', name: 'Xanh dương', color: '#2563EB' },
                    { id: 'emerald', name: 'Ngọc lục bảo', color: '#10B981' },
                    { id: 'indigo', name: 'Tím Indigo', color: '#6366F1' },
                  ].map((c) => (
                    <button
                      key={c.id}
                      type="button"
                      onClick={() => setAccent(c.id as AccentColor)}
                      className={`flex-1 py-1.5 px-1 rounded-xl border flex items-center justify-center gap-1 font-semibold transition-all cursor-pointer ${
                        accent === c.id
                          ? 'border-slate-800 bg-slate-50 text-slate-900 shadow-xs font-bold'
                          : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      <span
                        className="w-2.5 h-2.5 rounded-full shrink-0"
                        style={{ backgroundColor: c.color }}
                      />
                      <span className="text-[11px] truncate">{c.name.split(' ')[0]}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* 3. Cache Management (Giải quyết tốc độ Render Free Tier) */}
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80">
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-1.5 font-bold text-slate-800">
                    <Database className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Bộ nhớ đệm (API Cache)</span>
                  </div>
                  <span className="text-[11px] font-mono font-bold text-emerald-700 bg-emerald-100/80 px-2 py-0.5 rounded-full">
                    {cacheCount} danh sách
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 leading-relaxed mb-2.5">
                  Dữ liệu danh mục đã tải được lưu tạm để chuyển tab tức thì (0s), giảm thời gian chờ máy chủ.
                </p>
                <button
                  type="button"
                  onClick={handleClearCache}
                  className="w-full py-1.5 px-3 rounded-lg bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 font-bold transition-all flex items-center justify-center gap-2 cursor-pointer shadow-2xs hover:text-red-600"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Xóa bộ nhớ đệm & Tải mới</span>
                </button>
              </div>

              {/* 4. Quick Assistant Shortcut */}
              <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                <button
                  type="button"
                  onClick={handleOpenAiAssistant}
                  className="w-full py-2 px-3 rounded-xl bg-gradient-to-r from-red-500/10 to-rose-500/10 hover:from-red-500/20 hover:to-rose-500/20 border border-red-200 text-red-700 font-bold flex items-center justify-center gap-2 cursor-pointer transition-all"
                >
                  <Sparkles className="w-4 h-4 text-[#EE3D43]" />
                  <span>Mở Trợ lý AI Kho hàng</span>
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};
