import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Plus,
  History,
  Search,
  Bell,
  Settings,
  HelpCircle,
  ChevronDown,
  Building2,
  Package,
  ArrowDownLeft,
  ArrowUpRight,
} from 'lucide-react';
import { useAuthStore } from '../../stores/auth.store';

export const Header: React.FC = () => {
  const { user } = useAuthStore();
  const [showQuickAdd, setShowQuickAdd] = useState(false);
  const [selectedBranch, setSelectedBranch] = useState('Kho Tổng Hà Nội');
  const [showBranchMenu, setShowBranchMenu] = useState(false);

  return (
    <header className="h-14 px-6 flex items-center justify-between border-b border-slate-200 bg-white sticky top-0 z-10 shadow-2xs">
      {/* LEFT: Quick Action + History + Search Input */}
      <div className="flex items-center gap-3.5 flex-1 max-w-xl">
        {/* Quick Add Button (+) with Popover Menu */}
        <div className="relative">
          <button
            onClick={() => setShowQuickAdd(!showQuickAdd)}
            title="Thao tác nhanh"
            className="w-7 h-7 rounded-full bg-[#EE3D43] hover:bg-[#D9343A] text-white flex items-center justify-center transition-transform active:scale-95 shadow-xs cursor-pointer"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
          </button>

          {showQuickAdd && (
            <>
              <div
                className="fixed inset-0 z-20"
                onClick={() => setShowQuickAdd(false)}
              />
              <div className="absolute left-0 top-9 z-30 w-52 bg-white rounded-xl shadow-xl border border-slate-200 py-1.5 animate-in fade-in zoom-in-95 duration-100 text-xs">
                <div className="px-3 py-1.5 font-bold text-[10px] text-slate-400 uppercase tracking-wider">
                  Tạo nhanh
                </div>
                <Link
                  to="/products"
                  onClick={() => setShowQuickAdd(false)}
                  className="flex items-center gap-2.5 px-3 py-2 text-slate-700 hover:bg-slate-50 hover:text-slate-900 font-medium"
                >
                  <Package className="w-3.5 h-3.5 text-blue-500" />
                  <span>Thêm sản phẩm mới</span>
                </Link>
                <Link
                  to="/stock-transactions"
                  onClick={() => setShowQuickAdd(false)}
                  className="flex items-center gap-2.5 px-3 py-2 text-slate-700 hover:bg-slate-50 hover:text-slate-900 font-medium"
                >
                  <ArrowDownLeft className="w-3.5 h-3.5 text-emerald-500" />
                  <span>Tạo phiếu nhập kho</span>
                </Link>
                <Link
                  to="/stock-transactions"
                  onClick={() => setShowQuickAdd(false)}
                  className="flex items-center gap-2.5 px-3 py-2 text-slate-700 hover:bg-slate-50 hover:text-slate-900 font-medium"
                >
                  <ArrowUpRight className="w-3.5 h-3.5 text-rose-500" />
                  <span>Tạo phiếu xuất kho</span>
                </Link>
              </div>
            </>
          )}
        </div>

        {/* History Icon */}
        <Link
          to="/audit-logs"
          title="Lịch sử thao tác"
          className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors"
        >
          <History className="w-4 h-4" />
        </Link>

        {/* Pill Search Input */}
        <div className="relative flex-1 max-w-sm">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
          <input
            type="text"
            placeholder="Tìm kiếm sản phẩm, mã vạch, kho hàng..."
            className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-200/90 rounded-full text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:bg-white focus:border-slate-300 focus:ring-2 focus:ring-[#EE3D43]/10 transition-all"
          />
        </div>
      </div>

      {/* RIGHT: Branch Switcher + Actions + Profile */}
      <div className="flex items-center gap-3">
        {/* Branch / Warehouse Dropdown */}
        <div className="relative">
          <button
            onClick={() => setShowBranchMenu(!showBranchMenu)}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <Building2 className="w-3.5 h-3.5 text-slate-500" />
            <span>{selectedBranch}</span>
            <ChevronDown className="w-3 h-3 text-slate-400" />
          </button>

          {showBranchMenu && (
            <>
              <div
                className="fixed inset-0 z-20"
                onClick={() => setShowBranchMenu(false)}
              />
              <div className="absolute right-0 top-9 z-30 w-48 bg-white rounded-xl shadow-xl border border-slate-200 py-1.5 text-xs animate-in fade-in zoom-in-95 duration-100">
                <div className="px-3 py-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  Chọn chi nhánh kho
                </div>
                {['Kho Tổng Hà Nội', 'Kho Miền Nam - Tân Tạo', 'Kho Đà Nẵng', 'Toàn hệ thống'].map(
                  (branch) => (
                    <button
                      key={branch}
                      onClick={() => {
                        setSelectedBranch(branch);
                        setShowBranchMenu(false);
                      }}
                      className={`w-full text-left px-3 py-2 font-medium transition-colors ${
                        selectedBranch === branch
                          ? 'bg-rose-50 text-[#EE3D43] font-bold'
                          : 'text-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      {branch}
                    </button>
                  )
                )}
              </div>
            </>
          )}
        </div>

        {/* Divider */}
        <div className="w-[1px] h-5 bg-slate-200" />

        {/* Notification Bell */}
        <button
          title="Thông báo"
          className="relative p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
        >
          <Bell className="w-4 h-4" />
          <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-[#EE3D43] ring-2 ring-white" />
        </button>

        {/* Settings */}
        <Link
          to="/profile"
          title="Cài đặt hệ thống"
          className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors"
        >
          <Settings className="w-4 h-4" />
        </Link>

        {/* Help */}
        <button
          title="Trợ giúp"
          className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
        >
          <HelpCircle className="w-4 h-4" />
        </button>

        {/* User Avatar */}
        <div className="flex items-center gap-2 pl-1 cursor-pointer">
          <div className="w-8 h-8 rounded-full bg-slate-200 border border-slate-300 flex items-center justify-center text-xs font-bold text-slate-700 shadow-2xs">
            {user?.username?.substring(0, 2).toUpperCase() || 'AD'}
          </div>
        </div>
      </div>
    </header>
  );
};
