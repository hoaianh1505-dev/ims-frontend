import React, { useState, useEffect } from 'react';
import { X, Eye, EyeOff, Loader2 } from 'lucide-react';
import { UserItem, UserRole, CreateUserData, UpdateUserData } from '../../services/users.service';
import { ToggleSwitch } from './ToggleSwitch';

interface UserFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: UserItem | null; // null => create mode, user => edit mode
  onSubmitCreate: (data: CreateUserData) => Promise<void>;
  onSubmitUpdate: (id: string, data: UpdateUserData) => Promise<void>;
}

export const UserFormModal: React.FC<UserFormModalProps> = ({
  isOpen,
  onClose,
  user,
  onSubmitCreate,
  onSubmitUpdate,
}) => {
  const isEdit = Boolean(user);

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [role, setRole] = useState<UserRole>('STAFF');
  const [isActive, setIsActive] = useState(true);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (user) {
      setUsername(user.username);
      setPassword('');
      setDisplayName(user.display_name || '');
      setEmail(user.email || '');
      setPhone(user.phone || '');
      setRole(user.role);
      setIsActive(user.is_active);
    } else {
      setUsername('');
      setPassword('');
      setDisplayName('');
      setEmail('');
      setPhone('');
      setRole('STAFF');
      setIsActive(true);
    }
    setError('');
    setShowPassword(false);
  }, [user, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!isEdit) {
      if (!username.trim()) {
        setError('Vui lòng nhập tên đăng nhập');
        return;
      }
      if (!password.trim() || password.length < 6) {
        setError('Mật khẩu tối thiểu 6 ký tự');
        return;
      }
    }

    setLoading(true);
    try {
      if (isEdit && user) {
        await onSubmitUpdate(user.id, {
          display_name: displayName.trim() || undefined,
          email: email.trim() || undefined,
          phone: phone.trim() || undefined,
          role,
          is_active: isActive,
        });
      } else {
        await onSubmitCreate({
          username: username.trim().toLowerCase(),
          password,
          display_name: displayName.trim() || undefined,
          email: email.trim() || undefined,
          phone: phone.trim() || undefined,
          role,
        });
      }
      onClose();
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Có lỗi xảy ra, vui lòng thử lại');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-lg w-full border border-slate-200 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <h3 className="text-base font-bold text-slate-900">
            {isEdit ? `Cập nhật tài khoản: ${user?.username}` : 'Thêm tài khoản mới'}
          </h3>
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs font-medium text-rose-700">
              {error}
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Username */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Tên đăng nhập {!isEdit && <span className="text-rose-500">*</span>}
              </label>
              <input
                type="text"
                disabled={isEdit}
                value={username}
                onChange={(e) => setUsername(e.target.value.toLowerCase().trim())}
                placeholder="vd: hoanganh"
                className={`w-full px-3.5 py-2 border rounded-xl text-sm font-medium text-slate-800 transition-all ${
                  isEdit
                    ? 'bg-slate-100 border-slate-200 text-slate-500 cursor-not-allowed'
                    : 'bg-slate-50 border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#EE3D43]/20 focus:bg-white'
                }`}
              />
            </div>

            {/* Password (only in create mode) */}
            {!isEdit ? (
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Mật khẩu <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Tối thiểu 6 ký tự"
                    className="w-full pl-3.5 pr-9 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#EE3D43]/20 focus:bg-white transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1"
                  >
                    {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>
            ) : (
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Mật khẩu
                </label>
                <div className="text-xs text-slate-400 py-2.5 italic">
                  Dùng chức năng "Đặt lại mật khẩu" nếu cần đổi.
                </div>
              </div>
            )}
          </div>

          {/* Full Name */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Họ và tên
            </label>
            <input
              type="text"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder="vd: Đỗ Hoài Anh"
              className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#EE3D43]/20 focus:bg-white transition-all"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Email */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="user@gmail.com"
                className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#EE3D43]/20 focus:bg-white transition-all"
              />
            </div>

            {/* Phone */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Số điện thoại
              </label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="0912345678"
                className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#EE3D43]/20 focus:bg-white transition-all"
              />
            </div>
          </div>

          {/* Role Select */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Vai trò (Phân quyền)
            </label>
            {isEdit && user?.role === 'ADMIN' ? (
              <div className="px-3.5 py-2.5 bg-slate-100 border border-slate-200 rounded-xl text-sm font-semibold text-rose-700 flex items-center justify-between">
                <span>Quản trị viên (Admin)</span>
                <span className="text-xs text-slate-400 font-normal">Cố định, không thể đổi vai trò</span>
              </div>
            ) : (
              <select
                value={role}
                onChange={(e) => setRole(e.target.value as UserRole)}
                className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#EE3D43]/20 focus:bg-white transition-all cursor-pointer"
              >
                <option value="STAFF">Nhân viên kho (Staff) — Thao tác nhập xuất thực tế</option>
                <option value="MANAGER">Quản lý kho (Manager) — Quản lý kho, duyệt phiếu</option>
              </select>
            )}
          </div>

          {/* Active Status Toggle (in edit mode for non-admin users) */}
          {isEdit && user?.role !== 'ADMIN' && (
            <div className="flex items-center justify-between p-3 bg-slate-50 border border-slate-200 rounded-xl">
              <div>
                <span className="text-xs font-bold text-slate-800 block">Trạng thái hoạt động</span>
                <span className="text-[11px] text-slate-500">
                  {isActive ? 'Đang hoạt động (Được phép đăng nhập)' : 'Đã khóa (Không thể đăng nhập)'}
                </span>
              </div>
              <ToggleSwitch checked={isActive} onChange={setIsActive} />
            </div>
          )}

          {/* Buttons */}
          <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-slate-200 text-slate-600 hover:bg-slate-50 rounded-xl text-xs font-semibold transition-colors cursor-pointer"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={loading}
              className="inline-flex items-center gap-2 px-5 py-2 bg-[#EE3D43] hover:bg-[#D9343A] text-white rounded-xl text-xs font-bold shadow-xs transition-colors cursor-pointer disabled:opacity-50"
            >
              {loading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
              <span>{loading ? 'Đang lưu...' : isEdit ? 'Lưu thay đổi' : 'Tạo tài khoản'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

