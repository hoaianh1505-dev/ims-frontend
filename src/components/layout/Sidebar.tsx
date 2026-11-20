import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutGrid,
  Package,
  Layers,
  Building2,
  ArrowLeftRight,
  ShoppingCart,
  Truck,
  Users,
  FileText,
  ShieldCheck,
  History,
  Lock,
  ChevronRight,
  ChevronLeft,
  X,
  PanelLeftClose,
  PanelLeftOpen,
} from 'lucide-react';
import { Logo } from './Logo';
import { useAuthStore } from '../../stores/auth.store';

interface SidebarProps {
  isMobileOpen?: boolean;
  onClose?: () => void;
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  isMobileOpen = false,
  onClose,
  isCollapsed: controlledIsCollapsed,
  onToggleCollapse,
}) => {
  const { user } = useAuthStore();
  const currentRole = user?.role || 'STAFF';

  // Quản lý trạng thái co/giãn (collapsed) lưu vào localStorage
  const [internalIsCollapsed, setInternalIsCollapsed] = useState(() => {
    return localStorage.getItem('ims_sidebar_collapsed') === 'true';
  });

  const isCollapsed =
    controlledIsCollapsed !== undefined ? controlledIsCollapsed : internalIsCollapsed;

  const toggleCollapse = () => {
    if (onToggleCollapse) {
      onToggleCollapse();
    } else {
      const next = !internalIsCollapsed;
      setInternalIsCollapsed(next);
      localStorage.setItem('ims_sidebar_collapsed', String(next));
    }
  };

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
          className={`w-full flex items-center ${
            isCollapsed ? 'justify-center px-2 py-3' : 'justify-between px-3.5 py-2.5'
          } rounded-xl text-xs font-medium text-slate-500 cursor-not-allowed select-none opacity-40`}
        >
          <div className="flex items-center gap-3">
            <span className="text-slate-500 shrink-0">{icon}</span>
            {!isCollapsed && <span className="text-sm">{label}</span>}
          </div>
          {!isCollapsed && <Lock className="w-3.5 h-3.5 text-slate-500 shrink-0" />}
        </div>
      );
    }

    return (
      <NavLink
        key={to}
        to={to}
        onClick={() => onClose?.()}
        className={({ isActive }) =>
          `w-full relative group flex items-center ${
            isCollapsed ? 'justify-center px-2 py-3' : 'justify-between px-3.5 py-2.5'
          } rounded-xl transition-all ${
            isActive
              ? 'bg-[#EE3D43] text-white font-bold shadow-xs'
              : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900 font-medium'
          }`
        }
      >
        {({ isActive }) => (
          <>
            <div className="flex items-center gap-3 min-w-0">
              <span
                className={`shrink-0 ${
                  isActive ? 'text-white' : 'text-slate-500 group-hover:text-slate-800 transition-colors'
                }`}
              >
                {icon}
              </span>
              {!isCollapsed && (
                <span className="text-sm font-semibold truncate tracking-tight">{label}</span>
              )}
            </div>

            {!isCollapsed && hasSubmenu && (
              <ChevronRight
                className={`w-4 h-4 shrink-0 transition-transform ${
                  isActive ? 'text-white/80' : 'text-slate-400 group-hover:text-slate-600'
                }`}
              />
            )}

            {/* Floating Tooltip khi Sidebar co lại (Collapsed) */}
            {isCollapsed && (
              <div className="absolute left-full ml-3 px-3 py-1.5 bg-slate-900 text-white text-xs font-bold rounded-xl shadow-xl whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50 border border-slate-800">
                {label}
              </div>
            )}
          </>
        )}
      </NavLink>
    );
  };

  const renderNavContent = (isMobile: boolean = false) => {
    const collapsed = isMobile ? false : isCollapsed;

    return (
      <nav className="flex-1 px-3 py-3 space-y-4 overflow-y-auto custom-scrollbar">
        {/* Core Nav */}
        <div className="space-y-1">
          {renderNavItem('/', 'Dashboard', <LayoutGrid className="w-5 h-5 shrink-0" />, true)}
        </div>

        {/* Nhóm KHO HÀNG & SẢN PHẨM */}
        <div>
          {!collapsed ? (
            <div className="px-3 mb-2 text-xs font-bold text-slate-400 uppercase tracking-wider">
              Kho hàng & Sản phẩm
            </div>
          ) : (
            <div className="border-t border-slate-200 my-3 mx-2" />
          )}
          <div className="space-y-1">
            {renderNavItem('/products', 'Sản phẩm', <Package className="w-5 h-5 shrink-0" />, true, true)}
            {renderNavItem('/categories', 'Danh mục & Đơn vị', <Layers className="w-5 h-5 shrink-0" />, isManagerOrAdmin, false, 'Quản lý')}
            {renderNavItem('/warehouses', 'Tổ chức kho hàng', <Building2 className="w-5 h-5 shrink-0" />, isManagerOrAdmin, false, 'Quản lý')}
            {renderNavItem('/suppliers', 'Nhà cung cấp', <Truck className="w-5 h-5 shrink-0" />, isManagerOrAdmin, false, 'Quản lý')}
            {renderNavItem('/customers', 'Khách hàng & Đại lý', <Users className="w-5 h-5 shrink-0" />, true, false)}
          </div>
        </div>

        {/* Nhóm XUẤT NHẬP & VẬN HÀNH */}
        <div>
          {!collapsed ? (
            <div className="px-3 mb-2 text-xs font-bold text-slate-400 uppercase tracking-wider">
              Xuất nhập & Bán hàng
            </div>
          ) : (
            <div className="border-t border-slate-200 my-3 mx-2" />
          )}
          <div className="space-y-1">
            {renderNavItem('/purchase-orders', 'Đơn đặt hàng (PO)', <ShoppingCart className="w-5 h-5 shrink-0" />, true)}
            {renderNavItem('/stock-transactions', 'Xử lý xuất / nhập', <ArrowLeftRight className="w-5 h-5 shrink-0" />, true, true)}
            {renderNavItem('/my-tasks', 'Phiếu của tôi', <FileText className="w-5 h-5 shrink-0" />, true)}
          </div>
        </div>

        {/* Nhóm HỆ THỐNG */}
        <div>
          {!collapsed ? (
            <div className="px-3 mb-2 text-xs font-bold text-slate-400 uppercase tracking-wider">
              Hệ thống & Phân quyền
            </div>
          ) : (
            <div className="border-t border-slate-200 my-3 mx-2" />
          )}
          <div className="space-y-1">
            {renderNavItem('/users', 'Tài khoản & quyền', <ShieldCheck className="w-5 h-5 shrink-0" />, isAdmin, false, 'Admin')}
            {renderNavItem('/audit-logs', 'Nhật ký hệ thống', <History className="w-5 h-5 shrink-0" />, isAdmin, false, 'Admin')}
          </div>
        </div>
      </nav>
    );
  };

  return (
    <>
      {/* 1. Desktop Static Sidebar (Tone màu sáng đồng bộ, thanh lịch) */}
      <aside
        className={`hidden lg:flex ${
          isCollapsed ? 'w-20' : 'w-64'
        } bg-white border-r border-slate-200 h-full flex-col shrink-0 z-20 select-none transition-all duration-300 relative shadow-2xs`}
      >
        {/* Brand Header */}
        <div
          className={`p-4 pb-3.5 border-b border-slate-100 flex items-center ${
            isCollapsed ? 'justify-center' : 'justify-between'
          }`}
        >
          <Logo variant="light" showText={!isCollapsed} />
          {!isCollapsed && (
            <button
              type="button"
              onClick={toggleCollapse}
              className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
              title="Thu nhỏ thanh bên (Co lại)"
            >
              <PanelLeftClose className="w-4.5 h-4.5" />
            </button>
          )}
        </div>

        {/* Nút mở rộng khi đã co lại */}
        {isCollapsed && (
          <div className="px-3 py-2 border-b border-slate-100 flex justify-center">
            <button
              type="button"
              onClick={toggleCollapse}
              className="p-2 text-slate-400 hover:text-slate-700 rounded-xl hover:bg-slate-100 transition-colors cursor-pointer"
              title="Mở rộng thanh bên"
            >
              <PanelLeftOpen className="w-5 h-5" />
            </button>
          </div>
        )}

        {renderNavContent(false)}

        {/* Footer Collapse Button */}
        {!isCollapsed && (
          <div className="p-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-400">
            <span>Phiên bản v2.6 Pro</span>
            <button
              type="button"
              onClick={toggleCollapse}
              className="p-1 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
              title="Thu nhỏ thanh bên"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
          </div>
        )}
      </aside>

      {/* 2. Mobile Backdrop */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 bg-slate-900/40 z-40 backdrop-blur-xs lg:hidden transition-opacity duration-300"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      {/* 3. Mobile Slide-out Drawer */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-72 bg-white shadow-2xl flex flex-col transition-transform duration-300 ease-in-out lg:hidden select-none border-r border-slate-200 ${
          isMobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="p-4 pb-3.5 border-b border-slate-100 flex items-center justify-between">
          <Logo variant="light" />
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
            title="Đóng menu"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        {renderNavContent(true)}
      </aside>
    </>
  );
};
