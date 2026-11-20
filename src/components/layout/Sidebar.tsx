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
          className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-lg text-xs font-medium text-slate-500 cursor-not-allowed select-none opacity-50"
        >
          <div className="flex items-center gap-3">
            <span className="text-slate-500">{icon}</span>
            <span>{label}</span>
          </div>
          <Lock className="w-3.5 h-3.5 text-slate-500" />
        </div>
      );
    }

    return (
      <NavLink
        key={to}
        to={to}
        onClick={() => onClose?.()}
        className={({ isActive }) =>
          `w-full flex items-center justify-between px-3.5 py-2.5 rounded-lg text-xs font-medium transition-all group ${
            isActive
              ? 'bg-[#2563EB] text-white font-semibold shadow-xs'
              : 'text-slate-300 hover:bg-white/5 hover:text-white'
          }`
        }
      >
        {({ isActive }) => (
          <>
            <div className="flex items-center gap-3">
              <span className={isActive ? 'text-white' : 'text-slate-400 group-hover:text-white transition-colors'}>
                {icon}
              </span>
              <span>{label}</span>
            </div>
            {hasSubmenu && (
              <ChevronRight
                className={`w-3.5 h-3.5 transition-transform ${
                  isActive ? 'text-white/80' : 'text-slate-500 group-hover:text-slate-300'
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
        <div className="px-3 mb-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
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
        <div className="px-3 mb-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
          Xuất nhập & Bán hàng
        </div>
        <div className="space-y-1">
          {renderNavItem('/stock-transactions', 'Xử lý xuất / nhập', <ArrowLeftRight className="w-4 h-4 shrink-0" />, true, true)}
          {renderNavItem('/my-tasks', 'Phiếu của tôi', <FileText className="w-4 h-4 shrink-0" />, true)}
        </div>
      </div>

      {/* Nhóm HỆ THỐNG */}
      <div>
        <div className="px-3 mb-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
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
      {/* 1. Desktop Static Sidebar */}
      <aside className="hidden lg:flex w-64 bg-[#1B2129] border-r border-[#262E38] h-full flex-col shrink-0 z-20 select-none">
        {/* Brand Header */}
        <div className="p-5 pb-4 border-b border-[#262E38]/80">
          <Logo variant="dark" />
        </div>
        {renderNavContent()}
      </aside>

      {/* 2. Mobile Backdrop */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 bg-black/60 z-40 backdrop-blur-xs lg:hidden transition-opacity duration-300"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      {/* 3. Mobile Slide-out Drawer */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-72 bg-[#1B2129] shadow-2xl flex flex-col transition-transform duration-300 ease-in-out lg:hidden select-none ${
          isMobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="p-4 pb-3 border-b border-[#262E38] flex items-center justify-between">
          <Logo variant="dark" />
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-white/10 transition-colors"
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

