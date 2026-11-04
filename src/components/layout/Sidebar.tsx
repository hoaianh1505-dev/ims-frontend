import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutGrid,
  Package,
  Layers,
  Building2,
  ArrowLeftRight,
  Truck,
  FileText,
  User as UserIcon,
  ShieldCheck,
  History,
  LogOut,
  Lock,
} from 'lucide-react';
import { Logo } from './Logo';
import { useAuthStore } from '../../stores/auth.store';

export const Sidebar: React.FC = () => {
  const { user, logout } = useAuthStore();
  const currentRole = user?.role || 'STAFF';

  // Phân quyền
  const isAdmin = currentRole === 'ADMIN';
  const isManagerOrAdmin = currentRole === 'ADMIN' || currentRole === 'MANAGER';

  const renderNavItem = (
    to: string,
    label: string,
    icon: React.ReactNode,
    isAllowed: boolean,
    requiredRoleLabel?: string
  ) => {
    if (!isAllowed) {
      return (
        <div
          key={to}
          title={`Tính năng yêu cầu quyền ${requiredRoleLabel || 'Admin'}`}
          className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium text-slate-300 bg-slate-50/50 cursor-not-allowed select-none opacity-60"
        >
          <div className="flex items-center gap-3">
            {icon}
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
        className={({ isActive }) =>
          `w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
            isActive
              ? 'bg-brand-light text-brand-primary font-semibold shadow-xs'
              : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
          }`
        }
      >
        {icon}
        <span>{label}</span>
      </NavLink>
    );
  };

  return (
    <aside className="w-64 bg-white border-r border-slate-100 h-screen sticky top-0 flex flex-col shrink-0 z-20">
      <div className="p-6 pb-4">
        <Logo />
      </div>

      <nav className="flex-1 px-4 py-2 space-y-6 overflow-y-auto">
        {/* Nhóm QUẢN LÝ */}
        <div>
          <div className="px-3 mb-2 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
            Quản lý
          </div>
          <div className="space-y-1">
            {renderNavItem('/', 'Tổng quan', <LayoutGrid className="w-4 h-4 shrink-0" />, true)}
            {renderNavItem('/products', 'Sản phẩm', <Package className="w-4 h-4 shrink-0" />, true)}
            {renderNavItem('/categories', 'Danh mục & Đơn vị', <Layers className="w-4 h-4 shrink-0" />, isManagerOrAdmin, 'Quản lý')}
            {renderNavItem('/warehouses', 'Tổ chức kho', <Building2 className="w-4 h-4 shrink-0" />, isManagerOrAdmin, 'Quản lý')}
            {renderNavItem('/suppliers', 'Nhà cung cấp', <Truck className="w-4 h-4 shrink-0" />, isManagerOrAdmin, 'Quản lý')}
            {renderNavItem('/stock-transactions', 'Xử lý xuất / nhập', <ArrowLeftRight className="w-4 h-4 shrink-0" />, true)}
          </div>
        </div>

        {/* Nhóm CÁ NHÂN */}
        <div>
          <div className="px-3 mb-2 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
            Cá nhân
          </div>
          <div className="space-y-1">
            {renderNavItem('/my-tasks', 'Phiếu của tôi', <FileText className="w-4 h-4 shrink-0" />, true)}
            {renderNavItem('/profile', 'Hồ sơ cá nhân', <UserIcon className="w-4 h-4 shrink-0" />, true)}
          </div>
        </div>

        {/* Nhóm QUẢN TRỊ */}
        <div>
          <div className="px-3 mb-2 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
            Quản trị
          </div>
          <div className="space-y-1">
            {renderNavItem('/users', 'Tài khoản & quyền', <ShieldCheck className="w-4 h-4 shrink-0" />, isAdmin, 'Admin')}
            {renderNavItem('/audit-logs', 'Nhật ký hệ thống', <History className="w-4 h-4 shrink-0" />, isAdmin, 'Admin')}
          </div>
        </div>
      </nav>

      {/* User Info & Logout Button */}
      <div className="p-3 border-t border-slate-100 space-y-2">
        <div className="flex items-center gap-2.5 px-2.5 py-2 rounded-xl bg-slate-50 border border-slate-100">
          <div className="w-8 h-8 rounded-lg bg-brand-primary text-white flex items-center justify-center text-xs font-bold uppercase shrink-0 shadow-xs">
            {user?.username?.substring(0, 2) || 'AD'}
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-xs font-bold text-slate-800 truncate">
              {user?.full_name || user?.username || 'Administrator'}
            </div>
            <div className="text-[10px] text-slate-400 font-medium truncate flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
              {user?.role || 'ADMIN'}
            </div>
          </div>
        </div>

        <button
          onClick={logout}
          className="w-full flex items-center gap-2 px-3 py-2 text-xs font-medium text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
        >
          <LogOut className="w-3.5 h-3.5 shrink-0" />
          <span>Đăng xuất</span>
        </button>
      </div>
    </aside>
  );
};
