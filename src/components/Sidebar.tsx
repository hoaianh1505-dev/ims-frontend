import React from 'react';
import {
  LayoutGrid,
  Package,
  Building2,
  ArrowLeftRight,
  Truck,
  FileText,
  User,
  ShieldCheck,
  History,
} from 'lucide-react';
import { Logo } from './Logo';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ activeTab, setActiveTab }) => {
  return (
    <aside className="w-64 bg-white border-r border-slate-100 h-screen sticky top-0 flex flex-col shrink-0 z-20">
      {/* Brand Logo Header */}
      <div className="p-6 pb-4">
        <Logo />
      </div>

      {/* Navigation Sections */}
      <nav className="flex-1 px-4 py-2 space-y-6 overflow-y-auto">
        {/* Nhóm QUẢN LÝ */}
        <div>
          <div className="px-3 mb-2 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
            Quản lý
          </div>
          <div className="space-y-1">
            <button
              onClick={() => setActiveTab('dashboard')}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                activeTab === 'dashboard'
                  ? 'bg-brand-light text-brand-primary font-semibold shadow-sm'
                  : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
              }`}
            >
              <LayoutGrid className="w-4 h-4 shrink-0" />
              <span>Tổng quan</span>
            </button>

            <button
              onClick={() => setActiveTab('products')}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                activeTab === 'products'
                  ? 'bg-brand-light text-brand-primary font-semibold shadow-sm'
                  : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
              }`}
            >
              <Package className="w-4 h-4 shrink-0" />
              <span>Sản phẩm</span>
            </button>

            <button
              onClick={() => setActiveTab('warehouses')}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                activeTab === 'warehouses'
                  ? 'bg-brand-light text-brand-primary font-semibold shadow-sm'
                  : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
              }`}
            >
              <Building2 className="w-4 h-4 shrink-0" />
              <span>Tổ chức kho</span>
            </button>

            <button
              onClick={() => setActiveTab('suppliers')}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                activeTab === 'suppliers'
                  ? 'bg-brand-light text-brand-primary font-semibold shadow-sm'
                  : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
              }`}
            >
              <Truck className="w-4 h-4 shrink-0" />
              <span>Nhà cung cấp</span>
            </button>

            <button
              onClick={() => setActiveTab('transactions')}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                activeTab === 'transactions'
                  ? 'bg-brand-light text-brand-primary font-semibold shadow-sm'
                  : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
              }`}
            >
              <ArrowLeftRight className="w-4 h-4 shrink-0" />
              <span>Xử lý xuất / nhập</span>
            </button>
          </div>
        </div>

        {/* Nhóm CÁ NHÂN */}
        <div>
          <div className="px-3 mb-2 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
            Cá nhân
          </div>
          <div className="space-y-1">
            <button
              onClick={() => setActiveTab('my-tasks')}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                activeTab === 'my-tasks'
                  ? 'bg-brand-light text-brand-primary font-semibold'
                  : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
              }`}
            >
              <FileText className="w-4 h-4 shrink-0" />
              <span>Phiếu của tôi</span>
            </button>

            <button
              onClick={() => setActiveTab('profile')}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                activeTab === 'profile'
                  ? 'bg-brand-light text-brand-primary font-semibold'
                  : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
              }`}
            >
              <User className="w-4 h-4 shrink-0" />
              <span>Hồ sơ cá nhân</span>
            </button>
          </div>
        </div>

        {/* Nhóm QUẢN TRỊ */}
        <div>
          <div className="px-3 mb-2 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
            Quản trị
          </div>
          <div className="space-y-1">
            <button
              onClick={() => setActiveTab('users')}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                activeTab === 'users'
                  ? 'bg-brand-light text-brand-primary font-semibold'
                  : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
              }`}
            >
              <ShieldCheck className="w-4 h-4 shrink-0" />
              <span>Tài khoản & quyền</span>
            </button>

            <button
              onClick={() => setActiveTab('audit-logs')}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                activeTab === 'audit-logs'
                  ? 'bg-brand-light text-brand-primary font-semibold'
                  : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
              }`}
            >
              <History className="w-4 h-4 shrink-0" />
              <span>Nhật ký hệ thống</span>
            </button>
          </div>
        </div>
      </nav>

      {/* Footer Info */}
      <div className="p-4 border-t border-slate-100 text-xs text-slate-400 flex items-center justify-between">
        <span>IMS v1.0.0</span>
        <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
      </div>
    </aside>
  );
};

