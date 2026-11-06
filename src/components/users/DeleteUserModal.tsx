import React, { useState } from 'react';
import { AlertTriangle, Loader2 } from 'lucide-react';
import { UserItem } from '../../services/users.service';

interface DeleteUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: UserItem | null;
  onDelete: (id: string) => Promise<void>;
}

export const DeleteUserModal: React.FC<DeleteUserModalProps> = ({
  isOpen,
  onClose,
  user,
  onDelete,
}) => {
  const [loading, setLoading] = useState(false);

  if (!isOpen || !user) return null;

  const isAdmin = user.role === 'ADMIN';

  const handleConfirm = async () => {
    if (isAdmin) return;
    setLoading(true);
    try {
      await onDelete(user.id);
      onClose();
    } catch {
      // Handled by parent
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-sm w-full p-5 border border-slate-200 shadow-2xl space-y-4 animate-in fade-in zoom-in-95 duration-150">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center shrink-0 border border-rose-100">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900">
              {isAdmin ? 'Tài khoản được bảo vệ' : 'Xóa tài khoản người dùng'}
            </h3>
            <p className="text-xs text-slate-500">
              {isAdmin ? 'Quản trị viên hệ thống' : 'Hành động này không thể hoàn tác'}
            </p>
          </div>
        </div>

        <p className="text-xs text-slate-600 leading-relaxed">
          {isAdmin ? (
            <>
              Tài khoản <span className="font-bold text-slate-800">@{user.username}</span> mang vai trò <span className="font-semibold text-rose-600">Quản trị viên (Admin)</span> nên được bảo vệ và không thể xóa khỏi hệ thống.
            </>
          ) : (
            <>
              Bạn có chắc chắn muốn xóa tài khoản <span className="font-bold text-slate-800">@{user.username}</span>? Toàn bộ phiên đăng nhập của tài khoản này sẽ bị thu hồi.
            </>
          )}
        </p>

        <div className="flex items-center justify-end gap-2 pt-2">
          <button
            onClick={onClose}
            className="px-3.5 py-1.5 border border-slate-200 text-slate-600 rounded-xl hover:bg-slate-50 text-xs font-medium cursor-pointer"
          >
            {isAdmin ? 'Đóng' : 'Hủy'}
          </button>
          {!isAdmin && (
            <button
              onClick={handleConfirm}
              disabled={loading}
              className="px-4 py-1.5 bg-rose-600 text-white rounded-xl hover:bg-rose-700 text-xs font-semibold transition-colors flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
            >
              {loading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
              <span>{loading ? 'Đang xóa...' : 'Xóa tài khoản'}</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

