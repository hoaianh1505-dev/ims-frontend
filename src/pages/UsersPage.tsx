import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  Search,
  Plus,
  RefreshCw,
  X,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import {
  usersService,
  UserItem,
  UserRole,
  CreateUserData,
  UpdateUserData,
} from '../services/users.service';
import { useAuthStore } from '../stores/auth.store';
import { showToast } from '../utils/toast.util';
import { UserTable } from '../components/users/UserTable';
import { UserFormModal } from '../components/users/UserFormModal';
import { ResetPasswordModal } from '../components/users/ResetPasswordModal';
import { DeleteUserModal } from '../components/users/DeleteUserModal';

export const UsersPage: React.FC = () => {
  const { user: currentUser } = useAuthStore();

  // Data states
  const [users, setUsers] = useState<UserItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState<'all' | UserRole>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');

  // Pagination
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Modal states
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<UserItem | null>(null);
  const [resettingUser, setResettingUser] = useState<UserItem | null>(null);
  const [deletingUser, setDeletingUser] = useState<UserItem | null>(null);

  // Fetch Users
  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const res = await usersService.getAll({ limit: 100 });
      setUsers(res.data || []);
    } catch (err: any) {
      showToast.error(err?.response?.data?.message || 'Không thể tải danh sách tài khoản');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  // Filtered Users
  const filteredUsers = useMemo(() => {
    return users.filter((u) => {
      // Role filter
      if (roleFilter !== 'all' && u.role !== roleFilter) return false;

      // Status filter
      if (statusFilter === 'active' && !u.is_active) return false;
      if (statusFilter === 'inactive' && u.is_active) return false;

      // Search keyword
      if (search.trim()) {
        const q = search.toLowerCase();
        const matchUsername = u.username.toLowerCase().includes(q);
        const matchName = (u.display_name || '').toLowerCase().includes(q);
        const matchEmail = (u.email || '').toLowerCase().includes(q);
        const matchPhone = (u.phone || '').toLowerCase().includes(q);
        if (!matchUsername && !matchName && !matchEmail && !matchPhone) return false;
      }

      return true;
    });
  }, [users, roleFilter, statusFilter, search]);

  // Pagination calculation
  const totalItems = filteredUsers.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  const currentPage = Math.min(page, totalPages);
  const paginatedUsers = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredUsers.slice(start, start + pageSize);
  }, [filteredUsers, currentPage, pageSize]);

  // Counts by role
  const adminCount = useMemo(() => users.filter((u) => u.role === 'ADMIN').length, [users]);
  const managerCount = useMemo(() => users.filter((u) => u.role === 'MANAGER').length, [users]);
  const staffCount = useMemo(() => users.filter((u) => u.role === 'STAFF').length, [users]);

  // Handler: Create User
  const handleCreateUser = async (data: CreateUserData) => {
    await usersService.create(data);
    showToast.success(`Tạo tài khoản "${data.username}" thành công`);
    fetchUsers();
  };

  // Handler: Update User
  const handleUpdateUser = async (id: string, data: UpdateUserData) => {
    await usersService.update(id, data);
    showToast.success('Cập nhật tài khoản thành công');
    fetchUsers();
  };

  // Handler: Reset Password
  const handleResetPassword = async (id: string, newPassword?: string) => {
    const res = await usersService.resetPassword(id, newPassword);
    showToast.success('Đặt lại mật khẩu thành công');
    return res.temp_password;
  };

  // Handler: Toggle Active Status (via switch in table)
  const handleToggleActive = async (user: UserItem) => {
    if (currentUser?.id === user.id) {
      showToast.error('Không thể khóa chính tài khoản bạn đang đăng nhập');
      return;
    }

    try {
      await usersService.update(user.id, { is_active: !user.is_active });
      showToast.success(
        user.is_active
          ? `Đã khóa tài khoản "${user.username}"`
          : `Đã kích hoạt tài khoản "${user.username}"`
      );
      fetchUsers();
    } catch (err: any) {
      showToast.error(err?.response?.data?.message || 'Không thể cập nhật trạng thái');
    }
  };

  // Handler: Delete User
  const handleDeleteUser = async (id: string) => {
    if (currentUser?.id === id) {
      showToast.error('Không thể xóa chính tài khoản bạn đang đăng nhập');
      return;
    }
    await usersService.delete(id);
    showToast.success('Xóa tài khoản thành công');
    fetchUsers();
  };

  return (
    <div className="flex-1 flex flex-col min-h-0 px-6 sm:px-8 py-4 max-w-[1560px] w-full mx-auto space-y-3.5">
      {/* PAGE HEADER */}
      <div className="shrink-0 flex items-center justify-between gap-4 pb-2 border-b border-slate-100 min-h-[52px]">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            Quản lý tài khoản
          </h1>
          <p className="text-sm font-medium text-slate-500 mt-0.5">
            Danh sách người dùng và phân quyền vai trò trong hệ thống kho
          </p>
        </div>

        <div className="flex items-center gap-2.5 shrink-0">
          <button
            onClick={() => fetchUsers()}
            className="p-2.5 text-slate-500 hover:text-slate-800 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors shadow-2xs cursor-pointer"
            title="Làm mới dữ liệu từ server"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-slate-700' : ''}`} />
          </button>

          <button
            onClick={() => {
              setEditingUser(null);
              setIsFormOpen(true);
            }}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#EE3D43] hover:bg-[#D9343A] text-white rounded-xl text-sm font-bold shadow-xs transition-colors cursor-pointer"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>Thêm tài khoản</span>
          </button>
        </div>
      </div>

      {/* TOOLBAR */}
      <div className="shrink-0 bg-white p-3 sm:p-3.5 rounded-2xl border border-slate-200 shadow-2xs flex flex-wrap items-center justify-between gap-3 min-h-[58px]">
        {/* Search */}
        <div className="relative flex-1 min-w-[260px] max-w-sm">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            placeholder="Tìm theo họ tên, username, email, SĐT..."
            className="w-full pl-10 pr-8 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#EE3D43]/15 focus:border-slate-300 focus:bg-white transition-all"
          />
          {search && (
            <button
              onClick={() => setSearch('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Role Filter Tabs */}
        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl text-sm font-medium text-slate-600">
          <button
            onClick={() => {
              setRoleFilter('all');
              setPage(1);
            }}
            className={`px-3 py-1.5 rounded-lg transition-all duration-150 active:scale-95 cursor-pointer ${
              roleFilter === 'all'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Tất cả ({users.length})
          </button>
          <button
            onClick={() => {
              setRoleFilter('ADMIN');
              setPage(1);
            }}
            className={`px-3 py-1.5 rounded-lg transition-all duration-150 active:scale-95 cursor-pointer ${
              roleFilter === 'ADMIN'
                ? 'bg-white text-rose-700 font-semibold shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Admin ({adminCount})
          </button>
          <button
            onClick={() => {
              setRoleFilter('MANAGER');
              setPage(1);
            }}
            className={`px-3 py-1.5 rounded-lg transition-all duration-150 active:scale-95 cursor-pointer ${
              roleFilter === 'MANAGER'
                ? 'bg-white text-amber-800 font-semibold shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Quản lý kho ({managerCount})
          </button>
          <button
            onClick={() => {
              setRoleFilter('STAFF');
              setPage(1);
            }}
            className={`px-3 py-1.5 rounded-lg transition-all duration-150 active:scale-95 cursor-pointer ${
              roleFilter === 'STAFF'
                ? 'bg-white text-blue-700 font-semibold shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Nhân viên ({staffCount})
          </button>
        </div>

        {/* Status Dropdown */}
        <select
          value={statusFilter}
          onChange={(e) => {
            setStatusFilter(e.target.value as any);
            setPage(1);
          }}
          className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-700 focus:outline-none focus:border-slate-400 transition-all cursor-pointer"
        >
          <option value="all">Tất cả trạng thái</option>
          <option value="active">Đang hoạt động</option>
          <option value="inactive">Đã khóa</option>
        </select>
      </div>

      {/* TABLE CARD */}
      <div className="flex-1 min-h-[480px] bg-white rounded-2xl border border-slate-200 shadow-sm flex flex-col overflow-hidden">
        <div className="flex-1 min-h-0 overflow-auto">
          <UserTable
            users={paginatedUsers}
            loading={loading}
            currentUserId={currentUser?.id}
            onEdit={(user) => {
              setEditingUser(user);
              setIsFormOpen(true);
            }}
            onResetPassword={(user) => setResettingUser(user)}
            onDelete={(user) => setDeletingUser(user)}
            onToggleActive={handleToggleActive}
          />
        </div>

        {/* Compact Pagination Bar */}
        <div className="shrink-0 px-5 py-2.5 border-t border-slate-200/80 bg-slate-50/50 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-slate-500">
          <div className="flex items-center gap-3">
            <span>
              Hiển thị <span className="font-semibold text-slate-800">{paginatedUsers.length}</span> / {totalItems} tài khoản
            </span>
            <div className="flex items-center gap-1 text-[11px]">
              <span>Mỗi trang:</span>
              <select
                value={pageSize}
                onChange={(e) => {
                  setPageSize(Number(e.target.value));
                  setPage(1);
                }}
                className="px-1.5 py-0.5 bg-white border border-slate-200 rounded text-[11px] font-medium text-slate-700 cursor-pointer focus:outline-none"
              >
                <option value={10}>10</option>
                <option value={15}>15</option>
                <option value={30}>30</option>
              </select>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-slate-500 text-[11px]">
              Trang {currentPage} / {totalPages}
            </span>
            <div className="flex items-center gap-1">
              <button
                disabled={currentPage <= 1}
                onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
                className="p-1 border border-slate-200 bg-white rounded-md hover:bg-slate-50 text-slate-600 disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
                title="Trang trước"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
              </button>
              <button
                disabled={currentPage >= totalPages}
                onClick={() => setPage((prev) => Math.min(prev + 1, totalPages))}
                className="p-1 border border-slate-200 bg-white rounded-md hover:bg-slate-50 text-slate-600 disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
                title="Trang tiếp"
              >
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* USER FORM MODAL (CREATE / EDIT) */}
      <UserFormModal
        isOpen={isFormOpen}
        onClose={() => {
          setIsFormOpen(false);
          setEditingUser(null);
        }}
        user={editingUser}
        onSubmitCreate={handleCreateUser}
        onSubmitUpdate={handleUpdateUser}
      />

      {/* RESET PASSWORD MODAL */}
      <ResetPasswordModal
        isOpen={Boolean(resettingUser)}
        onClose={() => setResettingUser(null)}
        user={resettingUser}
        onReset={handleResetPassword}
      />

      {/* DELETE CONFIRM MODAL */}
      <DeleteUserModal
        isOpen={Boolean(deletingUser)}
        onClose={() => setDeletingUser(null)}
        user={deletingUser}
        onDelete={handleDeleteUser}
      />
    </div>
  );
};
