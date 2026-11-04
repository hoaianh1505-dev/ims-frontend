import React from 'react';
import { useLocation } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';

const routeTitleMap: Record<string, string> = {
  '/': 'Tổng quan',
  '/dashboard': 'Tổng quan',
  '/products': 'Sản phẩm',
  '/categories': 'Danh mục & Đơn vị tính',
  '/warehouses': 'Tổ chức kho hàng',
  '/suppliers': 'Nhà cung cấp',
  '/stock-transactions': 'Xử lý xuất / nhập kho',
  '/my-tasks': 'Phiếu của tôi',
  '/profile': 'Hồ sơ cá nhân',
  '/users': 'Tài khoản & quyền',
  '/audit-logs': 'Nhật ký hệ thống',
};

export const Header: React.FC = () => {
  const location = useLocation();
  const currentTitle = routeTitleMap[location.pathname] || 'Tổng quan';

  return (
    <header className="h-14 px-8 flex items-center justify-between border-b border-slate-100 bg-white/60 backdrop-blur-sm shrink-0 z-10">
      <div className="flex items-center gap-2 text-xs font-medium text-slate-500">
        <span className="hover:text-slate-800 cursor-pointer transition-colors">Không gian làm việc</span>
        <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
        <span className="text-slate-800 font-semibold">{currentTitle}</span>
      </div>

      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2 px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-medium text-slate-700 shadow-2xs hover:bg-slate-50 cursor-pointer transition-colors">
          <span className="w-1.5 h-1.5 rounded-full bg-brand-primary"></span>
          <span>Toàn hệ thống kho</span>
        </div>
        <div className="text-xs font-medium text-slate-500">
          04.11.2026
        </div>
      </div>
    </header>
  );
};
