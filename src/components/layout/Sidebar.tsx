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
    requiredRoleLabel?: string
  ) => {
    if (!isAllowed) {
      return (
        <div
          key={to}
          title={`Tính năng yêu cầu quyền ${requiredRoleLabel || 'Admin'}`}
          className={`w-full flex items-center ${
            isCollapsed ? 'justify-center px-2 py-3' : 'justify-between px-3.5 py-2.5'
          } rounded-[3px] text-xs font-medium text-slate-500 cursor-not-allowed select-none opacity-40`}
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
          } rounded-[3px] transition-colors ${
            isActive
              ? 'bg-[#344e45] text-white font-bold before:absolute before:inset-y-2 before:left-0 before:w-0.5 before:bg-[#a8c0b4]'
              : 'text-slate-300 hover:bg-white/[0.07] hover:text-white font-medium'
          }`
        }
      >
        {({ isActive }) => (
          <>
            <div className="flex items-center gap-3 min-w-0">
              <span
                className={`shrink-0 ${
                  isActive ? 'text-white' : 'text-slate-400 group-hover:text-white transition-colors'
                }`}
              >
                {icon}
              </span>
              {!isCollapsed && (
                <span className="text-sm font-semibold truncate tracking-tight">{label}</span>
              )}
            </div>

            {!isCollapsed && isActive && (
              <ChevronRight className="w-4 h-4 shrink-0 text-white animate-in fade-in duration-150" />
            )}

            {/* Floating Tooltip khi Sidebar co lại (Collapsed) */}
            {isCollapsed && (
              <div className="absolute left-full ml-3 px-3 py-1.5 bg-[#1B2129] text-white text-xs font-bold rounded-xl shadow-xl whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50 border border-[#262E38]">
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
            <div className="border-t border-[#262E38] my-3 mx-2" />
          )}
          <div className="space-y-1">
            {renderNavItem('/products', 'Sản phẩm', <Package className="w-5 h-5 shrink-0" />, true)}
            {renderNavItem('/categories', 'Danh mục & Đơn vị', <Layers className="w-5 h-5 shrink-0" />, isManagerOrAdmin, 'Quản lý')}
            {renderNavItem('/warehouses', 'Tổ chức kho hàng', <Building2 className="w-5 h-5 shrink-0" />, isManagerOrAdmin, 'Quản lý')}
            {renderNavItem('/suppliers', 'Nhà cung cấp', <Truck className="w-5 h-5 shrink-0" />, isManagerOrAdmin, 'Quản lý')}
            {renderNavItem('/customers', 'Khách hàng & Đại lý', <Users className="w-5 h-5 shrink-0" />, true)}
          </div>
        </div>

        {/* Nhóm XUẤT NHẬP & VẬN HÀNH */}
        <div>
          {!collapsed ? (
            <div className="px-3 mb-2 text-xs font-bold text-slate-400 uppercase tracking-wider">
              Xuất nhập & Bán hàng
            </div>
          ) : (
            <div className="border-t border-[#262E38] my-3 mx-2" />
          )}
          <div className="space-y-1">
            {renderNavItem('/purchase-orders', 'Đơn đặt hàng (PO)', <ShoppingCart className="w-5 h-5 shrink-0" />, true)}
            {renderNavItem('/stock-transactions', 'Xử lý xuất / nhập', <ArrowLeftRight className="w-5 h-5 shrink-0" />, true)}
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
            <div className="border-t border-[#262E38] my-3 mx-2" />
          )}
          <div className="space-y-1">
            {renderNavItem('/users', 'Tài khoản & quyền', <ShieldCheck className="w-5 h-5 shrink-0" />, isAdmin, 'Admin')}
            {renderNavItem('/audit-logs', 'Nhật ký hệ thống', <History className="w-5 h-5 shrink-0" />, isAdmin, 'Admin')}
          </div>
        </div>
      </nav>
    );
  };

  return (
    <>
      {/* 1. Desktop Static Sidebar (Hỗ trợ Co/Giãn tiện lợi) */}
      <aside
        className={`hidden lg:flex ${
          isCollapsed ? 'w-20' : 'w-64'
        } bg-[#1B2129] border-r border-[#262E38] h-full flex-col shrink-0 z-20 select-none transition-all duration-300 relative`}
      >
        {/* Brand Header */}
        <div
          className={`p-4 pb-3.5 border-b border-[#262E38]/80 flex items-center ${
            isCollapsed ? 'justify-center' : 'justify-between'
          }`}
        >
          <Logo variant="dark" showText={!isCollapsed} />
          {!isCollapsed && (
            <button
              type="button"
              onClick={toggleCollapse}
              className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-white/10 transition-colors cursor-pointer"
              title="Thu nhỏ thanh bên (Co lại)"
            >
              <PanelLeftClose className="w-4.5 h-4.5" />
            </button>
          )}
        </div>

        {/* Nút mở rộng khi đã co lại */}
        {isCollapsed && (
          <div className="px-3 py-2 border-b border-[#262E38]/60 flex justify-center">
            <button
              type="button"
              onClick={toggleCollapse}
              className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-white/10 transition-colors cursor-pointer"
              title="Mở rộng thanh bên"
            >
              <PanelLeftOpen className="w-5 h-5" />
            </button>
          </div>
        )}

        {renderNavContent(false)}

        {/* Footer Collapse Button */}
        {!isCollapsed && (
          <div className="p-3 border-t border-[#262E38]/80 flex items-center justify-between text-xs text-slate-400">
            <span>Phiên bản v2.6 Pro</span>
            <button
              type="button"
              onClick={toggleCollapse}
              className="p-1 text-slate-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors cursor-pointer"
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
          className="fixed inset-0 bg-black/60 z-40 backdrop-blur-xs lg:hidden transition-opacity duration-300"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      {/* 3. Mobile Slide-out Drawer (Luôn mở rộng đầy đủ) */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-72 bg-[#1B2129] shadow-2xl flex flex-col transition-transform duration-300 ease-in-out lg:hidden select-none ${
          isMobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="p-4 pb-3.5 border-b border-[#262E38] flex items-center justify-between">
          <Logo variant="dark" />
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-white/10 transition-colors cursor-pointer"
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
