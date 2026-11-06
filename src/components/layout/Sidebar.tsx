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
  ChevronRight,
} from 'lucide-react';
import { Logo } from './Logo';
import { useAuthStore } from '../../stores/auth.store';

export const Sidebar: React.FC = () => {
  const { user, logout } = useAuthStore();
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
        className={({ isActive }) =>
          `w-full flex items-center justify-between px-3.5 py-2.5 rounded-lg text-xs font-medium transition-all group ${
            isActive
              ? 'bg-[#EE3D43] text-white font-semibold shadow-xs'
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

  return (
    <aside className="w-64 bg-[#1B2129] border-r border-[#262E38] h-full flex flex-col shrink-0 z-20 select-none">
      {/* Brand Header */}
      <div className="p-5 pb-4 border-b border-[#262E38]/80">
        <Logo variant="dark" />
      </div>

      {/* Navigation List */}
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
            {renderNavItem('/profile', 'Hồ sơ cá nhân', <UserIcon className="w-4 h-4 shrink-0" />, true)}
            {renderNavItem('/users', 'Tài khoản & quyền', <ShieldCheck className="w-4 h-4 shrink-0" />, isAdmin, false, 'Admin')}
            {renderNavItem('/audit-logs', 'Nhật ký hệ thống', <History className="w-4 h-4 shrink-0" />, isAdmin, false, 'Admin')}
          </div>
        </div>
      </nav>

      {/* User Info & Logout Button */}
      <div className="p-3 border-t border-[#262E38] space-y-2 bg-[#171C23]">
        <div className="flex items-center gap-2.5 px-2.5 py-2 rounded-lg bg-[#202731] border border-[#2B3542]">
          <div className="w-7 h-7 rounded-md bg-[#EE3D43] text-white flex items-center justify-center text-xs font-bold uppercase shrink-0 shadow-xs">
            {user?.username?.substring(0, 2) || 'AD'}
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-xs font-bold text-white truncate">
              {user?.full_name || user?.username || 'Administrator'}
            </div>
            <div className="text-[10px] text-slate-400 font-medium truncate flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
              {user?.role || 'ADMIN'}
            </div>
          </div>
        </div>

        <button
          onClick={logout}
          className="w-full flex items-center gap-2 px-3 py-1.5 text-xs font-medium text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors cursor-pointer"
        >
          <LogOut className="w-3.5 h-3.5 shrink-0" />
          <span>Đăng xuất</span>
        </button>
      </div>
    </aside>
  );
};
