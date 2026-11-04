import React from 'react';
import { useLocation } from 'react-router-dom';
import { ChevronRight, Calendar } from 'lucide-react';

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
    <header className="h-14 px-8 flex items-center justify-between bg-brand-primary text-white border-b border-brand-dark/40 shadow-xs shrink-0 z-10">
      <div className="flex items-center gap-2 text-xs font-medium">
        <span className="text-emerald-100/70 hover:text-white cursor-pointer transition-colors">
          Không gian làm việc
        </span>
        <ChevronRight className="w-3.5 h-3.5 text-emerald-300/60" />
        <span className="text-white font-bold tracking-wide">{currentTitle}</span>
      </div>

      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2 px-3 py-1.5 bg-emerald-950/40 border border-emerald-600/40 rounded-lg text-xs font-medium text-emerald-100 shadow-2xs hover:bg-emerald-950/60 cursor-pointer transition-colors">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
          <span>Toàn hệ thống kho</span>
        </div>
        <div className="text-xs font-medium text-emerald-200/80 flex items-center gap-1.5">
          <Calendar className="w-3.5 h-3.5 text-emerald-300/70" />
          <span>04.11.2026</span>
        </div>
      </div>
    </header>
  );
};
