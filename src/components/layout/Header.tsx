import React, { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Plus,
  History,
  ChevronDown,
  Building2,
  Package,
  ArrowDownLeft,
  ArrowUpRight,
  User as UserIcon,
  LogOut,
  Camera,
  Loader2,
  Menu,
  Sun,
  Moon,
} from 'lucide-react';
import { useAuthStore } from '../../stores/auth.store';
import { useThemeStore } from '../../stores/theme.store';
import { UserAvatar } from '../common/UserAvatar';
import { NotificationDropdown } from './NotificationDropdown';
import { usersService } from '../../services/users.service';
import { warehousesService } from '../../services/warehouses.service';
import { showToast } from '../../utils/toast.util';

const ROLE_LABELS: Record<string, string> = {
  ADMIN: 'Quản trị viên',
  MANAGER: 'Quản lý kho',
  STAFF: 'Nhân viên kho',
};

interface HeaderProps {
  onOpenMobileSidebar?: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onOpenMobileSidebar }) => {
  const { user, logout, updateUser } = useAuthStore();
  const { theme, toggleTheme } = useThemeStore();
  const [showQuickAdd, setShowQuickAdd] = useState(false);
  const [selectedBranch, setSelectedBranch] = useState('Toàn hệ thống');
  const [warehousesList, setWarehousesList] = useState<string[]>(['Toàn hệ thống']);
  const [showBranchMenu, setShowBranchMenu] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const avatarInputRef = useRef<HTMLInputElement>(null);
  const roleLabel = ROLE_LABELS[user?.role || ''] || user?.role || '';

  // Load real warehouses list from PostgreSQL
  useEffect(() => {
    let isMounted = true;
    const fetchWarehouses = async () => {
      try {
        const res = await warehousesService.getAll({ limit: 50 });
        const list = Array.isArray((res as any)?.data)
          ? (res as any).data
          : Array.isArray(res)
          ? res
          : [];
        if (isMounted && list.length > 0) {
          const names = list.map((w: any) => w.name || w.code);
          setWarehousesList(['Toàn hệ thống', ...names]);
        }
      } catch (err) {
        // Fallback to default
      }
    };
    fetchWarehouses();
    return () => {
      isMounted = false;
    };
  }, []);

  const handleAvatarSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user?.id) return;

    if (!file.type.startsWith('image/')) {
      showToast.error('Vui lòng chọn file hình ảnh (jpg, png, webp)');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      showToast.error('Kích thước ảnh tối đa 5MB');
      return;
    }

    setUploadingAvatar(true);
    try {
      const res: any = await usersService.uploadAvatar(user.id, file);
      const newAvatarUrl = res?.avatar || res?.data?.avatar;
      if (newAvatarUrl) {
        updateUser({ avatar: newAvatarUrl });
        showToast.success('Cập nhật ảnh đại diện thành công!');
      }
    } catch (err: any) {
      const msg = err?.response?.data?.message || 'Không thể upload ảnh đại diện';
      showToast.error(Array.isArray(msg) ? msg[0] : msg);
    } finally {
      setUploadingAvatar(false);
      if (avatarInputRef.current) {
        avatarInputRef.current.value = '';
      }
    }
  };

  return (
    <header className="h-16 sm:h-[68px] px-3 sm:px-6 lg:px-8 flex items-center justify-between border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-[#151D2C] sticky top-0 z-10 shadow-2xs transition-colors">
      {/* LEFT: Mobile Menu Button + Quick Action + History */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Mobile Hamburger Toggle Button */}
        <button
          type="button"
          onClick={onOpenMobileSidebar}
          className="lg:hidden p-2 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors cursor-pointer"
          title="Mở menu điều hướng"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Quick Add Button (+) with Popover Menu */}
        <div className="relative">
          <button
            onClick={() => setShowQuickAdd(!showQuickAdd)}
            title="Thao tác nhanh"
            className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-[#EE3D43] hover:bg-[#D9343A] text-white flex items-center justify-center transition-all active:scale-95 shadow-sm cursor-pointer"
          >
            <Plus className="w-4 h-4 sm:w-5 sm:h-5 stroke-[2.5]" />
          </button>

          {showQuickAdd && (
            <>
              <div
                className="fixed inset-0 z-20"
                onClick={() => setShowQuickAdd(false)}
              />
              <div className="absolute left-0 top-11 z-30 w-56 bg-white dark:bg-[#151D2C] rounded-2xl shadow-xl border border-slate-200 dark:border-slate-800 py-2 animate-in fade-in zoom-in-95 duration-100 text-sm">
                <div className="px-4 py-1.5 font-bold text-xs text-slate-400 dark:text-slate-400 uppercase tracking-wider">
                  Tạo nhanh
                </div>
                <Link
                  to="/products"
                  onClick={() => setShowQuickAdd(false)}
                  className="flex items-center gap-3 px-4 py-2.5 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white font-medium"
                >
                  <Package className="w-4 h-4 text-blue-500" />
                  <span>Thêm sản phẩm mới</span>
                </Link>
                <Link
                  to="/stock-transactions?action=import"
                  onClick={() => setShowQuickAdd(false)}
                  className="flex items-center gap-3 px-4 py-2.5 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white font-medium"
                >
                  <ArrowDownLeft className="w-4 h-4 text-emerald-500" />
                  <span>Tạo phiếu nhập kho</span>
                </Link>
                <Link
                  to="/stock-transactions?action=export"
                  onClick={() => setShowQuickAdd(false)}
                  className="flex items-center gap-3 px-4 py-2.5 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white font-medium"
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
          className="p-1.5 sm:p-2 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
        >
          <History className="w-4 h-4 sm:w-5 sm:h-5" />
        </Link>
      </div>

      {/* RIGHT: Branch Switcher + Actions + Profile */}
      <div className="flex items-center gap-1.5 sm:gap-3">
        {/* Branch / Warehouse Dropdown */}
        <div className="relative">
          <button
            onClick={() => setShowBranchMenu(!showBranchMenu)}
            className="flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3.5 py-1.5 sm:py-2 rounded-xl text-xs sm:text-sm font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer border border-transparent hover:border-slate-200 dark:hover:border-slate-700"
          >
            <Building2 className="w-4 h-4 text-slate-500 dark:text-slate-400 shrink-0" />
            <span className="hidden md:inline">{selectedBranch}</span>
            <span className="md:hidden max-w-[80px] sm:max-w-[120px] truncate">{selectedBranch.replace('Kho ', '')}</span>
            <ChevronDown className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-slate-400 shrink-0" />
          </button>

          {showBranchMenu && (
            <>
              <div
                className="fixed inset-0 z-20"
                onClick={() => setShowBranchMenu(false)}
              />
              <div className="absolute right-0 top-11 z-30 w-56 bg-white dark:bg-[#151D2C] rounded-2xl shadow-xl border border-slate-200 dark:border-slate-800 py-2 text-sm animate-in fade-in zoom-in-95 duration-100">
                <div className="px-4 py-1.5 text-xs font-bold text-slate-400 dark:text-slate-400 uppercase tracking-wider">
                  Chọn chi nhánh kho
                </div>
                {warehousesList.map((branch) => (
                  <button
                    key={branch}
                    onClick={() => {
                      setSelectedBranch(branch);
                      setShowBranchMenu(false);
                    }}
                    className={`w-full text-left px-4 py-2.5 font-medium transition-colors ${
                      selectedBranch === branch
                        ? 'bg-rose-50 dark:bg-rose-950/40 text-[#EE3D43] font-bold'
                        : 'text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800'
                    }`}
                  >
                    {branch}
                  </button>
                ))}
              </div>
            </>
          )}
        </div>

        {/* Divider */}
        <div className="w-[1px] h-5 sm:h-6 bg-slate-200 dark:bg-slate-800 hidden xs:block" />

        {/* Theme Toggle Button (Chống chói / Dark Mode) */}
        <button
          type="button"
          onClick={toggleTheme}
          title={theme === 'dark' ? 'Chuyển sang giao diện sáng' : 'Chuyển sang giao diện tối (dịu mắt, chống chói)'}
          className="p-1.5 sm:p-2 text-slate-500 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer flex items-center justify-center"
        >
          {theme === 'dark' ? (
            <Sun className="w-4 h-4 sm:w-5 sm:h-5 text-amber-400" />
          ) : (
            <Moon className="w-4 h-4 sm:w-5 sm:h-5 text-slate-600" />
          )}
        </button>

        {/* Realtime Notification Bell */}
        <NotificationDropdown />

        {/* Hidden File Input for Avatar */}
        <input
          type="file"
          ref={avatarInputRef}
          accept="image/png,image/jpeg,image/webp,image/jpg"
          className="hidden"
          onChange={handleAvatarSelect}
        />

        {/* Profile Menu */}
        <div className="relative pl-1">
          <button
            onClick={() => setShowProfileMenu(!showProfileMenu)}
            className="flex items-center gap-2.5 pl-1 pr-2 py-1 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <UserAvatar src={user?.avatar} size="md" alt={user?.username || 'User'} />
            <div className="hidden md:block text-left leading-tight">
              <div className="text-sm font-semibold text-slate-800 dark:text-slate-200 max-w-[160px] truncate">
                {user?.full_name || user?.username}
              </div>
              <div className="text-xs text-slate-500 dark:text-slate-400">{roleLabel}</div>
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
          </button>

          {showProfileMenu && (
            <>
              <div className="fixed inset-0 z-20" onClick={() => setShowProfileMenu(false)} />
              <div className="absolute right-0 top-12 z-30 w-64 bg-white dark:bg-[#151D2C] rounded-2xl shadow-xl border border-slate-200 dark:border-slate-800 py-1.5 animate-in fade-in zoom-in-95 duration-100 text-sm overflow-hidden">
                <div className="px-4 py-3 border-b border-slate-100 dark:border-slate-800 flex items-center gap-3 bg-slate-50/50 dark:bg-slate-900/40">
                  <div className="relative group shrink-0">
                    <UserAvatar src={user?.avatar} size="lg" alt={user?.username || 'User'} />
                    <button
                      type="button"
                      disabled={uploadingAvatar}
                      onClick={() => avatarInputRef.current?.click()}
                      title="Đổi ảnh đại diện"
                      className="absolute inset-0 bg-slate-900/60 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer text-white"
                    >
                      {uploadingAvatar ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Camera className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-slate-800 truncate">
                      {user?.full_name || user?.username}
                    </div>
                    <div className="text-xs text-slate-500 truncate">
                      @{user?.username} · {roleLabel}
                    </div>
                    <button
                      type="button"
                      disabled={uploadingAvatar}
                      onClick={() => avatarInputRef.current?.click()}
                      className="text-[11px] font-semibold text-[#EE3D43] hover:underline mt-0.5 inline-flex items-center gap-1 cursor-pointer"
                    >
                      {uploadingAvatar ? (
                        <>
                          <Loader2 className="w-3 h-3 animate-spin" />
                          <span>Đang tải ảnh...</span>
                        </>
                      ) : (
                        <>
                          <Camera className="w-3 h-3" />
                          <span>Đổi ảnh đại diện</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
                <Link
                  to="/profile"
                  onClick={() => setShowProfileMenu(false)}
                  className="flex items-center gap-2.5 px-4 py-2 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800"
                >
                  <UserIcon className="w-4 h-4 text-slate-400" />
                  Hồ sơ cá nhân
                </Link>
                <div className="my-1 border-t border-slate-100 dark:border-slate-800" />
                <button
                  onClick={async () => {
                    setShowProfileMenu(false);
                    await logout();
                    showToast.info('Đã đăng xuất khỏi hệ thống');
                  }}
                  className="w-full flex items-center gap-2.5 px-4 py-2 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 cursor-pointer"
                >
                  <LogOut className="w-4 h-4" />
                  Đăng xuất
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
};
