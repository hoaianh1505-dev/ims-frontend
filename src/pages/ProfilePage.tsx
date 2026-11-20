import React, { useState, useRef, useEffect } from 'react';
import {
  User,
  Mail,
  Phone,
  Shield,
  KeyRound,
  Camera,
  Lock,
  Eye,
  EyeOff,
  Save,
  Loader2,
} from 'lucide-react';
import { useAuthStore } from '../stores/auth.store';
import { usersService } from '../services/users.service';
import { authService } from '../services/auth.service';
import { showToast } from '../utils/toast.util';
import { formatImageUrl } from '../utils/image.util';
import { UserAvatar } from '../components/common/UserAvatar';

const ROLE_LABELS: Record<string, { label: string; badge: string; desc: string }> = {
  ADMIN: {
    label: 'Quản trị viên (Super Admin)',
    badge: 'bg-red-50 text-red-700 border-red-200',
    desc: 'Toàn quyền cấu hình hệ thống, quản lý người dùng, phân quyền và dữ liệu.',
  },
  MANAGER: {
    label: 'Quản lý kho (Manager)',
    badge: 'bg-blue-50 text-blue-700 border-blue-200',
    desc: 'Phê duyệt phiếu xuất nhập, quản lý định mức tồn kho và kiểm kê.',
  },
  STAFF: {
    label: 'Nhân viên kho (Staff)',
    badge: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    desc: 'Thực hiện tạo phiếu nhập/xuất kho, quét mã vạch và kiểm đếm thực tế.',
  },
};

export const ProfilePage: React.FC = () => {
  const { user, updateUser } = useAuthStore();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Profile Form State
  const [displayName, setDisplayName] = useState(user?.display_name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const [previewAvatar, setPreviewAvatar] = useState<string | null>(null);
  const [avatarError, setAvatarError] = useState(false);

  // Sync fresh profile from server on mount
  useEffect(() => {
    authService.getProfile().then((fresh) => {
      if (fresh) {
        updateUser(fresh);
        if (fresh.display_name) setDisplayName(fresh.display_name);
        if (fresh.email) setEmail(fresh.email);
        if (fresh.phone) setPhone(fresh.phone);
      }
    }).catch(() => {});
  }, []);

  const activeAvatarSrc = previewAvatar || user?.avatar;
  const resolvedAvatarUrl = formatImageUrl(activeAvatarSrc);

  useEffect(() => {
    setAvatarError(false);
  }, [activeAvatarSrc]);

  // Password Form State
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrentPass, setShowCurrentPass] = useState(false);
  const [showNewPass, setShowNewPass] = useState(false);
  const [isChangingPass, setIsChangingPass] = useState(false);

  const roleInfo = ROLE_LABELS[user?.role || ''] || {
    label: user?.role || 'Người dùng',
    badge: 'bg-slate-50 text-slate-700 border-slate-200',
    desc: 'Người dùng hệ thống quản lý kho IMS.',
  };

  // Avatar Upload Handler
  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
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

    // Instant local preview
    const objectUrl = URL.createObjectURL(file);
    setPreviewAvatar(objectUrl);
    setAvatarError(false);

    try {
      setIsUploadingAvatar(true);
      const updated: any = await usersService.uploadAvatar(user.id, file);
      const newAvatar = updated?.avatar || updated?.data?.avatar;
      if (newAvatar) {
        updateUser({ avatar: newAvatar });
      }
      showToast.success('Cập nhật ảnh đại diện thành công!');
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Không thể tải ảnh đại diện lên.';
      showToast.error(msg);
      setPreviewAvatar(null);
    } finally {
      setIsUploadingAvatar(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  // Update Profile Info Handler
  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.id) return;

    try {
      setIsUpdatingProfile(true);
      const res = await usersService.update(user.id, {
        display_name: displayName.trim(),
        email: email.trim(),
        phone: phone.trim(),
      });

      updateUser({
        display_name: res.display_name || displayName.trim(),
        email: res.email || email.trim(),
        phone: res.phone || phone.trim(),
      });

      showToast.success('Cập nhật thông tin hồ sơ thành công!');
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Cập nhật thông tin thất bại.';
      showToast.error(msg);
    } finally {
      setIsUpdatingProfile(false);
    }
  };

  // Change Password Handler
  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentPassword.trim() || !newPassword.trim()) {
      showToast.warn('Vui lòng điền đầy đủ mật khẩu hiện tại và mật khẩu mới.');
      return;
    }

    if (newPassword.length < 6) {
      showToast.warn('Mật khẩu mới phải có ít nhất 6 ký tự.');
      return;
    }

    if (newPassword !== confirmPassword) {
      showToast.error('Mật khẩu xác nhận không khớp với mật khẩu mới.');
      return;
    }

    try {
      setIsChangingPass(true);
      await authService.changePassword(currentPassword, newPassword);
      showToast.success('Đổi mật khẩu thành công!');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Mật khẩu hiện tại không chính xác.';
      showToast.error(msg);
    } finally {
      setIsChangingPass(false);
    }
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto p-4 sm:p-6 lg:p-8 pb-16">
      {/* Page Title & Subtitle */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100 tracking-tight flex items-center gap-2.5">
          <User className="w-6 h-6 text-[#EE3D43]" />
          Hồ sơ cá nhân
        </h1>
        <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
          Quản lý thông tin định danh, tài khoản và bảo mật hệ thống
        </p>
      </div>

      {/* Main Profile Header Card (Enterprise Linear style) */}
      <div className="bg-white dark:bg-[#161b22] rounded-2xl border border-slate-200 dark:border-[#384252] shadow-sm p-6 sm:p-7">
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
          {/* Avatar with Camera upload button */}
          <div className="relative group shrink-0">
            <div className="w-24 h-24 rounded-2xl overflow-hidden ring-4 ring-slate-100 dark:ring-[#21262d] shadow-sm bg-slate-100 dark:bg-[#21262d] flex items-center justify-center">
              {resolvedAvatarUrl && !avatarError ? (
                <img
                  src={resolvedAvatarUrl}
                  alt={user?.display_name || user?.username || 'Avatar'}
                  onError={() => setAvatarError(true)}
                  className="w-full h-full object-cover"
                />
              ) : (
                <UserAvatar
                  src={null}
                  alt={user?.display_name || user?.username || 'Admin'}
                  className="w-full h-full text-2xl font-black rounded-none"
                />
              )}
              {isUploadingAvatar && (
                <div className="absolute inset-0 bg-black/60 flex items-center justify-center text-white">
                  <Loader2 className="w-7 h-7 animate-spin" />
                </div>
              )}
            </div>

            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploadingAvatar}
              className="absolute -bottom-2 -right-2 p-2 bg-[#EE3D43] hover:bg-[#D9343A] text-white rounded-xl shadow-md transition-transform hover:scale-110 cursor-pointer disabled:opacity-50"
              title="Đổi ảnh đại diện"
            >
              <Camera className="w-4 h-4" />
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleAvatarChange}
            />
          </div>

          {/* User Details */}
          <div className="text-center sm:text-left flex-1 min-w-0">
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2.5">
              <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-slate-100 tracking-tight">
                {user?.display_name || user?.username || 'Người dùng'}
              </h2>
              <span
                className={`inline-flex items-center gap-1.5 px-3 py-1 text-xs font-semibold rounded-full border ${roleInfo.badge} dark:bg-rose-500/10 dark:text-rose-300 dark:border-rose-500/20`}
              >
                <Shield className="w-3.5 h-3.5" />
                {roleInfo.label}
              </span>
            </div>

            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3 text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-2">
              <span className="font-medium text-slate-700 dark:text-slate-300">@{user?.username}</span>
              <span>•</span>
              <span className="inline-flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 font-semibold">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                Tài khoản đang hoạt động
              </span>
              {email && (
                <>
                  <span>•</span>
                  <span>{email}</span>
                </>
              )}
            </div>

            <p className="text-slate-600 dark:text-slate-400 text-xs sm:text-sm mt-3 leading-relaxed">
              {roleInfo.desc}
            </p>
          </div>
        </div>
      </div>

      {/* Grid: 2 Columns */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8">
        {/* Left Column: Account Details (7 Cols) */}
        <div className="lg:col-span-7 bg-white dark:bg-[#161b22] rounded-2xl border border-slate-200 dark:border-[#384252] shadow-sm p-6 sm:p-7">
          <div className="flex items-center gap-2.5 pb-4 border-b border-slate-100 dark:border-[#262f3d] mb-6">
            <div className="p-2 bg-rose-50 dark:bg-rose-500/10 text-[#EE3D43] rounded-xl">
              <User className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 dark:text-slate-100 text-base sm:text-lg">
                Thông tin tài khoản
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Cập nhật họ tên hiển thị và thông tin liên hệ
              </p>
            </div>
          </div>

          <form onSubmit={handleUpdateProfile} className="space-y-4 sm:space-y-5">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1.5">
                Tên đăng nhập (Username)
              </label>
              <input
                type="text"
                disabled
                value={user?.username || ''}
                className="w-full px-4 py-2.5 bg-slate-50 dark:bg-[#21262d] border border-slate-200 dark:border-[#384252] rounded-xl text-slate-500 dark:text-slate-400 font-medium cursor-not-allowed select-none text-sm"
              />
              <span className="text-[11px] text-slate-400 dark:text-slate-500 mt-1 block">
                Mã định danh hệ thống cố định
              </span>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                Tên hiển thị (Họ và tên)
              </label>
              <div className="relative">
                <User className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  required
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  placeholder="Nhập họ và tên..."
                  className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-[#21262d] border border-slate-300 dark:border-[#384252] rounded-xl text-slate-900 dark:text-slate-100 font-medium focus:outline-none focus:border-[#EE3D43] focus:ring-2 focus:ring-[#EE3D43]/20 transition-all text-sm"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                  Địa chỉ Email
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="email@example.com"
                    className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-[#21262d] border border-slate-300 dark:border-[#384252] rounded-xl text-slate-900 dark:text-slate-100 font-medium focus:outline-none focus:border-[#EE3D43] focus:ring-2 focus:ring-[#EE3D43]/20 transition-all text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                  Số điện thoại
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="0901 234 567"
                    className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-[#21262d] border border-slate-300 dark:border-[#384252] rounded-xl text-slate-900 dark:text-slate-100 font-medium focus:outline-none focus:border-[#EE3D43] focus:ring-2 focus:ring-[#EE3D43]/20 transition-all text-sm"
                  />
                </div>
              </div>
            </div>

            <div className="pt-3 flex justify-end">
              <button
                type="submit"
                disabled={isUpdatingProfile}
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#EE3D43] hover:bg-[#D9343A] text-white font-medium rounded-xl shadow-xs transition-all hover:shadow cursor-pointer disabled:opacity-50 text-sm"
              >
                {isUpdatingProfile ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Save className="w-4 h-4" />
                )}
                Lưu thông tin
              </button>
            </div>
          </form>
        </div>

        {/* Right Column: Security & Password (5 Cols) */}
        <div className="lg:col-span-5 space-y-5">
          <div className="bg-white dark:bg-[#161b22] rounded-2xl border border-slate-200 dark:border-[#384252] shadow-sm p-6 sm:p-7">
            <div className="flex items-center gap-2.5 pb-4 border-b border-slate-100 dark:border-[#262f3d] mb-6">
              <div className="p-2 bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400 rounded-xl">
                <KeyRound className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 dark:text-slate-100 text-base sm:text-lg">
                  Đổi mật khẩu
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Thiết lập mật khẩu mới để bảo vệ tài khoản
                </p>
              </div>
            </div>

            <form onSubmit={handleChangePassword} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                  Mật khẩu hiện tại
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type={showCurrentPass ? 'text' : 'password'}
                    required
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    placeholder="Mật khẩu hiện tại..."
                    className="w-full pl-10 pr-10 py-2.5 bg-white dark:bg-[#21262d] border border-slate-300 dark:border-[#384252] rounded-xl text-slate-900 dark:text-slate-100 font-medium focus:outline-none focus:border-[#EE3D43] focus:ring-2 focus:ring-[#EE3D43]/20 text-sm"
                  />
                  <button
                    type="button"
                    onClick={() => setShowCurrentPass(!showCurrentPass)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                  >
                    {showCurrentPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                  Mật khẩu mới
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type={showNewPass ? 'text' : 'password'}
                    required
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Tối thiểu 6 ký tự..."
                    className="w-full pl-10 pr-10 py-2.5 bg-white dark:bg-[#21262d] border border-slate-300 dark:border-[#384252] rounded-xl text-slate-900 dark:text-slate-100 font-medium focus:outline-none focus:border-[#EE3D43] focus:ring-2 focus:ring-[#EE3D43]/20 text-sm"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPass(!showNewPass)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                  >
                    {showNewPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                  Xác nhận mật khẩu mới
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="password"
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Nhập lại mật khẩu mới..."
                    className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-[#21262d] border border-slate-300 dark:border-[#384252] rounded-xl text-slate-900 dark:text-slate-100 font-medium focus:outline-none focus:border-[#EE3D43] focus:ring-2 focus:ring-[#EE3D43]/20 text-sm"
                  />
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isChangingPass}
                  className="w-full inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-slate-900 hover:bg-slate-800 dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-white text-white font-medium rounded-xl shadow-xs transition-all cursor-pointer disabled:opacity-50 text-sm"
                >
                  {isChangingPass ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <KeyRound className="w-4 h-4" />
                  )}
                  Cập nhật mật khẩu
                </button>
              </div>
            </form>
          </div>

          {/* Clean Security Tip Box */}
          <div className="bg-slate-50 dark:bg-[#161b22] border border-slate-200 dark:border-[#384252] rounded-xl p-4 text-xs text-slate-500 dark:text-slate-400 flex items-start gap-2.5">
            <Shield className="w-4 h-4 text-slate-400 mt-0.5 shrink-0" />
            <p className="leading-relaxed">
              Mật khẩu cần tối thiểu 6 ký tự. Phiên làm việc được chứng thực qua giao thức an toàn JWT.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
