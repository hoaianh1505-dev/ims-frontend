import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutGrid,
  Package,
  Layers,
  Building2,
  ArrowLeftRight,
  Truck,
  Users,
  FileText,
  ShieldCheck,
  History,
  Lock,
  ChevronRight,
  X,
} from 'lucide-react';
import { Logo } from './Logo';
import { useAuthStore } from '../../stores/auth.store';

interface SidebarProps {
  isMobileOpen?: boolean;
  onClose?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isMobileOpen = false, onClose }) => {
  const { user } = useAuthStore();
  const currentRole = user?.role || 'STAFF';

  const isAdmin = currentRole === 'ADMIN';
  const isManagerOrAdmin = currentRole === 'ADMIN' || currentRole === 'MANAGER';

  const renderNavItem = (
    to: string,
    label: string,
    icon: React.ReactNode,
    isAllowed: boolean,
    hasSubmenu: boolean = false,
    requiredRoleLabel?: string
  ) => {
    if (!isAllowed) {
      return (
        <div
          key={to}
          title={`Tính năng yêu cầu quyền ${requiredRoleLabel || 'Admin'}`}
          className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-medium text-slate-400 cursor-not-allowed select-none opacity-60"
        >
          <div className="flex items-center gap-3">
            <span className="text-slate-400">{icon}</span>
            <span>{label}</span>
          </div>
          <Lock className="w-3.5 h-3.5 text-slate-400" />
        </div>
      );
    }

    return (
      <NavLink
        key={to}
        to={to}
        onClick={() => onClose?.()}
        className={({ isActive }) =>
          `w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-medium transition-all group ${
            isActive
              ? 'bg-blue-50 text-blue-700 font-bold border-r-2 border-blue-600 shadow-2xs'
              : 'text-slate-700 hover:bg-slate-100 hover:text-slate-900 font-medium'
          }`
        }
      >
        {({ isActive }) => (
          <>
            <div className="flex items-center gap-3">
              <span className={isActive ? 'text-blue-600' : 'text-slate-500 group-hover:text-slate-900 transition-colors'}>
                {icon}
              </span>
              <span>{label}</span>
            </div>
            {hasSubmenu && (
              <ChevronRight
                className={`w-3.5 h-3.5 transition-transform ${
                  isActive ? 'text-blue-600' : 'text-slate-400 group-hover:text-slate-600'
                }`}
              />
            )}
          </>
        )}
      </NavLink>
    );
  };

  const renderNavContent = () => (
    <nav className="flex-1 px-3 py-3 space-y-5 overflow-y-auto custom-scrollbar">
      {/* Core Nav */}
      <div className="space-y-1">
        {renderNavItem('/', 'Dashboard', <LayoutGrid className="w-4 h-4 shrink-0" />, true)}
      </div>

      {/* Nhóm KHO HÀNG & SẢN PHẨM */}
      <div>
        <div className="px-3 mb-2 text-xs font-bold text-slate-500 uppercase tracking-wider">
          Kho hàng & Sản phẩm
        </div>
        <div className="space-y-1">
          {renderNavItem('/products', 'Sản phẩm', <Package className="w-4 h-4 shrink-0" />, true, true)}
          {renderNavItem('/categories', 'Danh mục & Đơn vị', <Layers className="w-4 h-4 shrink-0" />, isManagerOrAdmin, false, 'Quản lý')}
          {renderNavItem('/warehouses', 'Tổ chức kho hàng', <Building2 className="w-4 h-4 shrink-0" />, isManagerOrAdmin, false, 'Quản lý')}
          {renderNavItem('/suppliers', 'Nhà cung cấp', <Truck className="w-4 h-4 shrink-0" />, isManagerOrAdmin, false, 'Quản lý')}
          {renderNavItem('/customers', 'Khách hàng & Đại lý', <Users className="w-4 h-4 shrink-0" />, true, false)}
        </div>
      </div>

      {/* Nhóm XUẤT NHẬP & VẬN HÀNH */}
      <div>
        <div className="px-3 mb-2 text-xs font-bold text-slate-500 uppercase tracking-wider">
          Xuất nhập & Bán hàng
        </div>
        <div className="space-y-1">
          {renderNavItem('/stock-transactions', 'Xử lý xuất / nhập', <ArrowLeftRight className="w-4 h-4 shrink-0" />, true, true)}
          {renderNavItem('/my-tasks', 'Phiếu của tôi', <FileText className="w-4 h-4 shrink-0" />, true)}
        </div>
      </div>

      {/* Nhóm HỆ THỐNG */}
      <div>
        <div className="px-3 mb-2 text-xs font-bold text-slate-500 uppercase tracking-wider">
          Hệ thống & Phân quyền
        </div>
        <div className="space-y-1">
          {renderNavItem('/users', 'Tài khoản & quyền', <ShieldCheck className="w-4 h-4 shrink-0" />, isAdmin, false, 'Admin')}
          {renderNavItem('/audit-logs', 'Nhật ký hệ thống', <History className="w-4 h-4 shrink-0" />, isAdmin, false, 'Admin')}
        </div>
      </div>
    </nav>
  );

  return (
    <>
      {/* 1. Desktop Static Sidebar (Tone sáng đồng bộ toàn hệ thống, dễ nhìn, thanh lịch) */}
      <aside className="hidden lg:flex w-64 bg-white border-r border-slate-200 h-full flex-col shrink-0 z-20 select-none shadow-2xs">
        {/* Brand Header */}
        <div className="p-4 pb-3.5 border-b border-slate-200">
          <Logo variant="light" />
        </div>
        {renderNavContent()}
      </aside>

      {/* 2. Mobile Backdrop */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 backdrop-blur-xs lg:hidden transition-opacity duration-300"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      {/* 3. Mobile Slide-out Drawer (Tone sáng) */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-72 bg-white border-r border-slate-200 shadow-2xl flex flex-col transition-transform duration-300 ease-in-out lg:hidden select-none ${
          isMobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="p-4 pb-3.5 border-b border-slate-200 flex items-center justify-between">
          <Logo variant="light" />
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-slate-500 hover:text-slate-800 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
            title="Đóng menu"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        {renderNavContent()}
      </aside>
    </>
  );
};
