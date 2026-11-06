import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Plus,
  History,
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
import { UserAvatar } from '../common/UserAvatar';

export const Header: React.FC = () => {
  const { user } = useAuthStore();
  const [showQuickAdd, setShowQuickAdd] = useState(false);
  const [selectedBranch, setSelectedBranch] = useState('Kho Tổng Hà Nội');
  const [showBranchMenu, setShowBranchMenu] = useState(false);

  return (
    <header className="h-16 sm:h-[68px] px-6 sm:px-8 flex items-center justify-between border-b border-slate-200 bg-white sticky top-0 z-10 shadow-2xs">
      {/* LEFT: Quick Action + History */}
      <div className="flex items-center gap-3">
        {/* Quick Add Button (+) with Popover Menu */}
        <div className="relative">
          <button
            onClick={() => setShowQuickAdd(!showQuickAdd)}
            title="Thao tác nhanh"
            className="w-9 h-9 rounded-full bg-[#EE3D43] hover:bg-[#D9343A] text-white flex items-center justify-center transition-all active:scale-95 shadow-sm cursor-pointer"
          >
            <Plus className="w-5 h-5 stroke-[2.5]" />
          </button>

          {showQuickAdd && (
            <>
              <div
                className="fixed inset-0 z-20"
                onClick={() => setShowQuickAdd(false)}
              />
              <div className="absolute left-0 top-11 z-30 w-56 bg-white rounded-2xl shadow-xl border border-slate-200 py-2 animate-in fade-in zoom-in-95 duration-100 text-sm">
                <div className="px-4 py-1.5 font-bold text-xs text-slate-400 uppercase tracking-wider">
                  Tạo nhanh
                </div>
                <Link
                  to="/products"
                  onClick={() => setShowQuickAdd(false)}
                  className="flex items-center gap-3 px-4 py-2.5 text-slate-700 hover:bg-slate-50 hover:text-slate-900 font-medium"
                >
                  <Package className="w-4 h-4 text-blue-500" />
                  <span>Thêm sản phẩm mới</span>
                </Link>
                <Link
                  to="/stock-transactions"
                  onClick={() => setShowQuickAdd(false)}
                  className="flex items-center gap-3 px-4 py-2.5 text-slate-700 hover:bg-slate-50 hover:text-slate-900 font-medium"
                >
                  <ArrowDownLeft className="w-4 h-4 text-emerald-500" />
                  <span>Tạo phiếu nhập kho</span>
                </Link>
                <Link
                  to="/stock-transactions"
                  onClick={() => setShowQuickAdd(false)}
                  className="flex items-center gap-3 px-4 py-2.5 text-slate-700 hover:bg-slate-50 hover:text-slate-900 font-medium"
                >
                  <ArrowUpRight className="w-4 h-4 text-rose-500" />
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
          className="p-2 text-slate-400 hover:text-slate-700 rounded-xl hover:bg-slate-100 transition-colors"
        >
          <History className="w-5 h-5" />
        </Link>
      </div>

      {/* RIGHT: Branch Switcher + Actions + Profile */}
      <div className="flex items-center gap-3.5">
        {/* Branch / Warehouse Dropdown */}
        <div className="relative">
          <button
            onClick={() => setShowBranchMenu(!showBranchMenu)}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl text-sm font-semibold text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer border border-transparent hover:border-slate-200"
          >
            <Building2 className="w-4 h-4 text-slate-500" />
            <span>{selectedBranch}</span>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
          </button>

          {showBranchMenu && (
            <>
              <div
                className="fixed inset-0 z-20"
                onClick={() => setShowBranchMenu(false)}
              />
              <div className="absolute right-0 top-11 z-30 w-56 bg-white rounded-2xl shadow-xl border border-slate-200 py-2 text-sm animate-in fade-in zoom-in-95 duration-100">
                <div className="px-4 py-1.5 text-xs font-bold text-slate-400 uppercase tracking-wider">
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
                      className={`w-full text-left px-4 py-2.5 font-medium transition-colors ${
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
        <div className="w-[1px] h-6 bg-slate-200" />

        {/* Notification Bell */}
        <button
          title="Thông báo"
          className="relative p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
        >
          <Bell className="w-5 h-5" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-[#EE3D43] ring-2 ring-white" />
        </button>

        {/* Settings */}
        <Link
          to="/profile"
          title="Cài đặt hệ thống"
          className="p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition-colors"
        >
          <Settings className="w-5 h-5" />
        </Link>

        {/* Help */}
        <button
          title="Trợ giúp"
          className="p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
        >
          <HelpCircle className="w-5 h-5" />
        </button>

        {/* User Avatar */}
        <Link
          to="/profile"
          title={user?.full_name || user?.username || 'Hồ sơ tài khoản'}
          className="flex items-center gap-2 pl-1 cursor-pointer group"
        >
          <UserAvatar size="lg" alt={user?.username || 'User'} className="group-hover:border-slate-400 transition-colors" />
        </Link>
      </div>
    </header>
  );
};
