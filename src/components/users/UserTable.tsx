import React from 'react';
import {
  KeyRound,
  Edit3,
  Trash2,
  Users,
  Loader2,
} from 'lucide-react';
import { UserItem } from '../../services/users.service';
import { ToggleSwitch } from './ToggleSwitch';
import { UserAvatar } from '../common/UserAvatar';

interface UserTableProps {
  users: UserItem[];
  loading: boolean;
  currentUserId?: string;
  onEdit: (user: UserItem) => void;
  onResetPassword: (user: UserItem) => void;
  onDelete: (user: UserItem) => void;
  onToggleActive: (user: UserItem) => void;
}

export const UserTable: React.FC<UserTableProps> = ({
  users,
  loading,
  currentUserId,
  onEdit,
  onResetPassword,
  onDelete,
  onToggleActive,
}) => {
  if (loading && users.length === 0) {
    return (
      <div className="py-24 flex flex-col items-center justify-center gap-3 text-slate-400 h-full">
        <Loader2 className="w-7 h-7 animate-spin text-slate-600" />
        <span className="text-sm font-medium">Đang tải danh sách tài khoản...</span>
      </div>
    );
  }

  if (users.length === 0) {
    return (
      <div className="py-20 text-center text-slate-400 space-y-3 h-full flex flex-col items-center justify-center">
        <Users className="w-12 h-12 mx-auto text-slate-300 stroke-1" />
        <div className="text-base font-bold text-slate-800">Không tìm thấy tài khoản nào</div>
        <p className="text-sm text-slate-500 max-w-sm mx-auto">
          Thử thay đổi từ khóa tìm kiếm hoặc bấm "Thêm tài khoản" để tạo mới.
        </p>
      </div>
    );
  }

  return (
    <table className="w-full text-left border-collapse text-sm">
      <thead>
        <tr className="sticky top-0 bg-slate-50 z-10 border-b border-slate-200 text-slate-500 font-semibold uppercase tracking-wider text-xs select-none shadow-2xs">
          <th className="py-2.5 px-4 w-72">Tài khoản</th>
          <th className="py-2.5 px-4 w-44">Vai trò</th>
          <th className="py-2.5 px-4 min-w-[220px]">Liên hệ</th>
          <th className="py-2.5 px-4 w-44">Trạng thái</th>
          <th className="py-2.5 px-4 w-32">Ngày tạo</th>
          <th className="py-2.5 px-4 w-28 text-right whitespace-nowrap">Thao tác</th>
        </tr>
      </thead>
      <tbody className="divide-y divide-slate-100 text-slate-700 animate-tab-enter">
        {users.map((u) => {
          const isCurrent = currentUserId === u.id;
          const isAdminUser = u.role === 'ADMIN';

          return (
            <tr key={u.id} className="hover:bg-slate-50/80 transition-colors group">
              {/* Account Info */}
              <td className="py-2.5 px-4">
                <div className="flex items-center gap-3">
                  <UserAvatar src={u.avatar} alt={u.username} size="md" />
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="font-medium text-slate-800 group-hover:text-[#EE3D43] transition-colors text-sm line-clamp-1">
                        {u.display_name || u.username}
                      </span>
                      {isCurrent && (
                        <span className="text-[10px] font-semibold text-slate-500 bg-slate-100 px-1.5 py-0.2 rounded border border-slate-200">
                          Bạn
                        </span>
                      )}
                    </div>
                    <span className="font-mono text-xs text-slate-500 block mt-0.5">
                      @{u.username}
                    </span>
                  </div>
                </div>
              </td>

              {/* Role */}
              <td className="py-2.5 px-4 whitespace-nowrap">
                {u.role === 'ADMIN' ? (
                  <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200/70">
                    Quản trị viên
                  </span>
                ) : u.role === 'MANAGER' ? (
                  <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-amber-50 text-amber-800 border border-amber-200/70">
                    Quản lý kho
                  </span>
                ) : (
                  <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-slate-100 text-slate-700 border border-slate-200/70">
                    Nhân viên kho
                  </span>
                )}
              </td>

              {/* Contact (Clean ERP text without cheesy stacked icons) */}
              <td className="py-2.5 px-4">
                <div>
                  <div className="text-sm text-slate-700 truncate">
                    {u.email || <span className="text-slate-400 italic">Chưa có email</span>}
                  </div>
                  {u.phone && (
                    <div className="text-xs text-slate-400 font-mono mt-0.5">
                      {u.phone}
                    </div>
                  )}
                </div>
              </td>

              {/* Active Toggle Switch */}
              <td className="py-2.5 px-4 whitespace-nowrap">
                <div className="flex items-center gap-2.5">
                  <ToggleSwitch
                    checked={u.is_active}
                    disabled={isAdminUser || isCurrent}
                    onChange={() => onToggleActive(u)}
                    title={
                      isAdminUser
                        ? 'Tài khoản Quản trị viên luôn hoạt động, không thể khóa'
                        : isCurrent
                        ? 'Không thể tự khóa tài khoản của bạn'
                        : u.is_active
                        ? 'Bấm để khóa'
                        : 'Bấm để kích hoạt'
                    }
                  />
                  <span
                    className={`text-xs font-medium w-20 text-left ${
                      u.is_active ? 'text-emerald-700' : 'text-slate-400'
                    }`}
                  >
                    {u.is_active ? 'Hoạt động' : 'Tạm khóa'}
                  </span>
                </div>
              </td>

              {/* Created Date */}
              <td className="py-2.5 px-4 text-slate-500 text-xs whitespace-nowrap">
                {new Date(u.created_at).toLocaleDateString('vi-VN')}
              </td>

              {/* Actions */}
              <td className="py-2.5 px-4 text-right whitespace-nowrap">
                <div className="inline-flex items-center justify-end gap-1">
                  <button
                    onClick={() => onResetPassword(u)}
                    className="p-1.5 text-slate-400 hover:text-amber-700 hover:bg-amber-50 rounded-lg transition-colors cursor-pointer"
                    title="Đặt lại mật khẩu"
                  >
                    <KeyRound className="w-4 h-4" />
                  </button>

                  <button
                    onClick={() => onEdit(u)}
                    className="p-1.5 text-slate-400 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                    title="Chỉnh sửa tài khoản"
                  >
                    <Edit3 className="w-4 h-4" />
                  </button>

                  <button
                    disabled={isAdminUser || isCurrent}
                    onClick={() => onDelete(u)}
                    className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                      isAdminUser || isCurrent
                        ? 'text-slate-300 cursor-not-allowed opacity-40'
                        : 'text-slate-400 hover:text-rose-600 hover:bg-rose-50'
                    }`}
                    title={
                      isAdminUser
                        ? 'Không thể xóa tài khoản Quản trị viên'
                        : isCurrent
                        ? 'Không thể xóa tài khoản của bạn'
                        : 'Xóa tài khoản'
                    }
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
};
